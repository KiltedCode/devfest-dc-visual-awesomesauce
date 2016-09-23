(function() {
    'use strict';

    angular
        .module('rhgeek.sunburst')
        .directive('sunburst', Sunburst);

    Sunburst.$inject = ['$window'];

    function Sunburst($window) {
        var directive = {
            restrict: 'E',
            //templateUrl: 'sunburst.tpl.html',
            scope: {},
            link: linkFunc,
            controller: SunburstController,
            controllerAs: 'vm',
            bindToController: {
                loading : '=',
                medals  : '='
            }
        };

        return directive;

        function linkFunc(scope, ele, attr, vm) {
            var width  = (attr['width']  ? attr['width']  : Math.floor(ele[0].getBoundingClientRect().width)),
                height = (attr['height'] ? attr['height'] : Math.floor(ele[0].getBoundingClientRect().height)),
                padd   = 10,
                areaHeight = height - padd * 2,
                areaWidth  = width - padd * 2,
                radius = Math.min(areaWidth, areaHeight) / 2.25;
            var medalTree = {
                name : 'Rio 2016',
                children : []
            };

            /* set up scales */
            var xScale = d3.scale.linear()
                .range([0, 2 * Math.PI]);
            var yScale = d3.scale.sqrt()
                .range([0, radius]);
            var color = d3.scale.category20c();

            /* create svg element */
            var svg = d3.select(ele[0])
                .append('svg')
                .attr('width', areaWidth)
                .attr('height', areaHeight)
                .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ') rotate(-90 0 0)');

            var tooltip = d3.select(ele[0])
                .append('div')
                .attr('id', 'tooltip')
                .style('position', 'absolute')
                .style('z-index', '10')
                .style('opacity', 0);

            /* layout function for sunburst */
            var partition = d3.layout.partition()
                .value(function(d) {
                    return d.size;
                });

            /* arc function for calculating slices of sunburst */
            var arc = d3.svg.arc()
                .startAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, xScale(d.x)));
                })
                .endAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, xScale(d.x + d.dx)));
                })
                .innerRadius(function(d) {
                    return Math.max(0, yScale(d.y));
                })
                .outerRadius(function(d) {
                    return Math.max(0, yScale(d.y + d.dy));
                });

            /* tween function to interpolate scale */
            function arcTween(d) {
                var xd = d3.interpolate(xScale.domain(), [d.x, d.x + d.dx]),
                    yd = d3.interpolate(yScale.domain(), [d.y, 1]),
                    yr = d3.interpolate(yScale.range(), [d.y ? 20 : 0, radius]);
                return function(d, i) {
                    return i ? function(t) {
                        return arc(d);
                    } : function(t) {
                        xScale.domain(xd(t));
                        yScale.domain(yd(t)).range(yr(t));
                        return arc(d);
                    };
                };
            }

            /* tracking for current 'root' node */
            var root;

            /**
             * updateChart: updates the sunburst chart when new data arrives.
             * @param items: tree of data.
             */
            function updateChart(items) {
                root = items;

                /* temp remove of all due to click on new elements issue */
                svg.selectAll('g').remove();

                /* JOIN new data with old elements */
                var gs = svg.selectAll('g')
                    .data(partition.nodes(root));

                /* ENTER new elements present in new data */
                var g = gs.enter().append('g')
                    .on('click', click)
                    .on('mouseover', mouseoverArc)
                    .on('mousemove', mousemoveArc)
                    .on('mouseout', mouseoutArc);

                var path = g.append('path');

                /* UPDATE old elements present in new data */
                gs.select('path')
                    .style('fill', function(d) {
                        return color((d.co ? d.co : 'rio'));
                    })
                    .transition().duration(500)
                    .attr('d', arc)
                    .attr('class', function(d) {
                        if(d.medal) {
                            return 'medal-'+d.medal;
                        } else if(!d.co) {
                            return 'rio';
                        } else {
                            return '';
                        }
                    })
                    .each(function(d) {
                        this.x0 = d.x;
                        this.dx0 = d.dx;
                    });

                /* EXIT old elements not present in new data */
                gs.exit()
                    .transition()
                    .duration(500)
                    .style('fill-opacity', 0)
                    .remove();


                /* helper functions */

                /**
                 * click: zooms sunburst on selected arc (in or out).
                 * @param d: the current arc.
                 */
                function click(d) {
                    root = d;

                    path.transition()
                        .duration(750)
                        .attrTween('d', arcTween(d));
                }

                /**
                 * mouseoverArc: shows tooltip dive when mouse moves over arc.
                 * sets tooltip's html with helper function.
                 * @param d: the current arc.
                 * @returns {*}
                 */
                function mouseoverArc(d) {
                    tooltip.html(tooltipHTML(d));
                    return tooltip.transition()
                        .duration(50)
                        .style('opacity', 0.9);
                }

                /**
                 * mouseoutArc: hides tooltip div when mouse moves out of arcs.
                 * @returns {*}
                 */
                function mouseoutArc(){
                    return tooltip.style('opacity', 0);
                }

                /**
                 * mousemoveArc: moves tooltip div as mouse moves over arcs.
                 * @returns {*}
                 */
                function mousemoveArc() {
                    return tooltip
                        .style('top', (d3.event.pageY - 10) + 'px')
                        .style('left', (d3.event.pageX + 10) + 'px');
                }

                /**
                 * tooltipHTML: creates html for tooltip.
                 * bases output on depth for amount of information available.
                 * @param d: the current arc.
                 * @returns {string}: html formatted string to be used in tooltip div.
                 */
                function tooltipHTML(d) {
                    var html = '';
                    var m = d.value > 1 ? 'medals' : 'medal';
                    if(d.depth == 0) {
                        /* center node */
                        html = '<strong>Rio 2016 Summer Olympic Games</strong>';
                    }else if(d.depth == 1) {
                        /* country arc */
                        html = '<strong>' + d.name + '</strong> (' + d.value + ' ' + m + ')';
                    } else if(d.depth == 2) {
                        /* sport */
                        html = '<strong>' + d.name + '</strong> (' + d.value + ' ' + m + ' for ' + d.parent.name + ')';
                    } else if(d.depth == 3) {
                        /* event */
                        html = d.parent.name + ': <strong>' + d.name + '</strong> (' + d.value + ' ' + m + ' for ' + d.parent.parent.name + ')';
                    } else if(d.depth == 4) {
                        /* medal */
                        html = '<strong><span class="caps">' + d.medal + ':</span> ' + d.name + '</strong> (' + d.co + ')';
                        html += '<br />' + d.parent.parent.name + ': ' + d.parent.name;
                    }
                    return html;
                }

            }

            /**
             * dataToTree: function to convert medal list to tree.
             * @param medalList: chronological list of medals
             * @returns {{name: string, children: Array}}: tree of medals by country
             */
            function dataToTree(medalList) {
                var tempMedalTree = {
                    name : 'Rio 2016',
                    children : []
                };
                if(medalList && medalList.length > 0) {
                    var countries = {};
                    /* transform to objects first, or ease of exists check */
                    for(var i=0, l=medalList.length; i<l; ++i) {
                        var ev = medalList[i];
                        for(var m=0, ml=ev.medals.length; m<ml; ++m) {
                            var med = ev.medals[m];
                            /* create country if does not exist */
                            if(!countries[med.co]) {
                                countries[med.co] = {};
                            }
                            /* create sport if does not exist */
                            if(!countries[med.co][ev.sport]) {
                                countries[med.co][ev.sport] = {};
                            }
                            /* create event if does not exist */
                            if(!countries[med.co][ev.sport][ev.event]) {
                                countries[med.co][ev.sport][ev.event] = {
                                    name : ev.event,
                                    children : [],
                                    co : med.co
                                };
                            }
                            /* add medal */
                            med.size = 1;
                            countries[med.co][ev.sport][ev.event].children.push(med);
                        }
                    }
                    /* convert object to arrays for tree */
                    for(var co in countries) {
                        var country = {
                            name : co,
                            children : [],
                            co : co
                        };
                        for(var sp in countries[co]) {
                            var sport = {
                                name : sp,
                                children : [],
                                co : co
                            };
                            for(var evt in countries[co][sp]) {
                                sport.children.push(countries[co][sp][evt]);
                            }
                            country.children.push(sport);
                        }
                        tempMedalTree.children.push(country);
                    }
                }
                return tempMedalTree;
            }

            /**
             * resizeSunburst: recalculates width and height.
             * updates further values based off this.
             * calls updateChart.
             */
            function resizeSunburst() {
                width  = (attr['width']  ? attr['width']  : Math.floor(ele[0].getBoundingClientRect().width));
                height = (attr['height'] ? attr['height'] : Math.floor(ele[0].getBoundingClientRect().height));
                padd   = 10;
                areaHeight = height - padd * 2;
                areaWidth  = width - padd * 2;
                radius = Math.min(areaWidth, areaHeight) / 2.25;

                yScale = d3.scale.sqrt()
                    .range([0, radius]);

                d3.select('svg')
                    .attr('width', areaWidth)
                    .attr('height', areaHeight);
                svg.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ') rotate(-90 0 0)');

                updateChart(medalTree);
            }

            /* watch on loading to know to pull rebuild tree */
            scope.$watch('vm.loading', function() {
                if(!vm.loading) {
                    medalTree = dataToTree(vm.medals);
                    updateChart(medalTree);
                }
            });

            /* watch window resize to adjust svg size */
            angular.element($window).on('resize', resizeSunburst);

            /* turn off watch when directive destroyed */
            scope.$on('$destroy', function () {
                angular.element($window).off('resize', resizeSunburst);
            });

        }
    }

    SunburstController.$inject = [];

    function SunburstController() {
        var vm = this;

    }

})();