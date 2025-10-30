window.CycleRatioLab = {
    chartInstances: {},

    // Create a chart by chainring
    createChainringChart: function (canvasId, data, displayMode, translations) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const ctx = canvas.getContext('2d');

        // Responsive sizing
        const screenWidth = window.innerWidth;
        const pointRadius = screenWidth < 480 ? 2 : screenWidth < 768 ? 3 : 4;
        const pointHoverRadius = screenWidth < 480 ? 4 : screenWidth < 768 ? 5 : 6;
        const borderWidth = screenWidth < 480 ? 1 : screenWidth < 768 ? 1.5 : 2;

        const chainrings = [...new Set(data.map(d => d.chainring))].sort((a, b) => b - a);
        const colors = ['#FF6B6B', '#276CF5', '#F7DC6F', '#4ECDC4', '#FFA07A', '#98D8C8'];

        const datasets = chainrings.map((chainring, index) => {
            const chainringData = data.filter(d => d.chainring === chainring);
            return {
                label: `${chainring}T`,
                data: chainringData.map(d => ({
                    x: d.sprocket,
                    y: displayMode === 'distance' ? d.development : d.ratio
                })),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length],
                tension: 0.1,
                borderWidth: borderWidth,
                pointRadius: pointRadius,
                pointHoverRadius: pointHoverRadius
            };
        });

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: screenWidth < 480 ? 1.2 : 3,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: { weight: 'bold' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y.toFixed(2);
                                const unit = displayMode === 'distance' ? ' m' : '';
                                return `${label}: ${value}${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: translations.sprocket || 'Dents Cassette',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            font: { weight: 'bold' }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: displayMode === 'distance' ? (translations.distance || 'Développement (m)') : (translations.ratio || 'Ratio'),
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            font: { weight: 'bold' }
                        }
                    }
                }
            }
        });
    },

    // Create continuous chart
    createContinuousChart: function (canvasId, data, displayMode, translations, TypeOfSort) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const ctx = canvas.getContext('2d');

        // Responsive sizing
        const screenWidth = window.innerWidth;
        const pointRadius = screenWidth < 480 ? 2 : screenWidth < 768 ? 3 : 4;
        const pointHoverRadius = screenWidth < 480 ? 4 : screenWidth < 768 ? 5 : 6;
        const borderWidth = screenWidth < 480 ? 1 : screenWidth < 768 ? 1.5 : 2;

        const sortedData = [...data].sort((a, b) => {
            const valueA = displayMode === 'distance' ? a.development : a.ratio;
            const valueB = displayMode === 'distance' ? b.development : b.ratio;
            return valueA - valueB;
        });

        const chainrings = [...new Set(data.map(d => d.chainring))].sort((a, b) => b - a);
        const colors = ['#FF6B6B', '#276CF5', '#F7DC6F', '#4ECDC4', '#FFA07A', '#98D8C8'];
        const chainringColorMap = {};
        chainrings.forEach((chainring, index) => {
            chainringColorMap[chainring] = colors[index % colors.length];
        });

        const pointColors = sortedData.map(d => chainringColorMap[d.chainring]);

        let pointData;
        if (TypeOfSort == 1) {
            pointData = sortedData.map(d => ({
                x: d.sprocket,
                y: displayMode === 'distance' ? d.development : d.ratio,
                chainring: d.chainring,
                sprocket: d.sprocket
            }));
        } else {
            pointData = sortedData.map((d, index) => ({
                x: sortedData.length - index,
                y: displayMode === 'distance' ? d.development : d.ratio,
                chainring: d.chainring,
                sprocket: d.sprocket
            }));
        }

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Tous les rapports',
                    data: pointData,
                    borderColor: '#666',
                    backgroundColor: pointColors,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: pointColors,
                    tension: 0.1,
                    borderWidth: borderWidth,
                    pointRadius: pointRadius,
                    pointHoverRadius: pointHoverRadius
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: screenWidth < 480 ? 1.2 : 3,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const point = context.raw;
                                const value = point.y.toFixed(2);
                                const unit = displayMode === 'distance' ? ' m' : '';
                                return `${point.chainring}T / ${point.sprocket}T: ${value}${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: TypeOfSort === 1 ? translations.sprocket || 'Dents Cassette' : 'Index',
                            font: { weight: 'bold' }
                        },
                        ticks: { font: { weight: 'bold' } }
                    },
                    y: {
                        title: {
                            display: true,
                            text: displayMode === 'distance' ? (translations.distance || 'Développement (m)') : (translations.ratio || 'Ratio'),
                            font: { weight: 'bold' }
                        },
                        ticks: { font: { weight: 'bold' } }
                    }
                }
            }
        });
    }
};
