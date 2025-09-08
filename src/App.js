// Clinical Risk Prediction Dashboard JavaScript - Complete Fixed Version
import './style.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineController,
  BarController,
  DoughnutController
} from 'chart.js';

// Register Chart.js components including all required controllers
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  DoughnutController
);
// Application state
const appState = {
    patients: [],
    filteredPatients: [],
    currentFilter: 'all',
    currentSort: { field: 'name', direction: 'asc' },
    currentPage: 1,
    patientsPerPage: 10,
    selectedPatient: null,
    riskThresholds: { low: 0.3, medium: 0.7, high: 1.0 },
    clinicalActions: {
        high: ["Schedule immediate follow-up", "Review medication regimen", "Consider hospitalization", "Increase monitoring frequency"],
        medium: ["Schedule follow-up within 1 week", "Review lifestyle factors", "Adjust treatment plan", "Patient education"],
        low: ["Continue current plan", "Routine follow-up", "Lifestyle maintenance", "Preventive care"]
    },
    alertTypes: ["Critical Risk", "Medication Alert", "Lab Alert", "Vital Signs Alert"],
    charts: {
        riskTrend: null,
        featureImportance: null,
        riskDistribution: null,
        ageRisk: null
    },
    updateInterval: null
};

// Patient data
const patientData = {
    "patients": [
        {
            "id": 1,
            "name": "Sarah Johnson",
            "age": 67,
            "riskScore": 0.78,
            "keyFactors": ["Uncontrolled BP", "Missed medications"],
            "lastUpdated": "2025-09-08T10:30:00",
            "vitals": {"bloodPressure": {"systolic": 165, "diastolic": 95}, "heartRate": 88, "glucose": 145, "weight": 82},
            "labResults": {"hemoglobin": 11.2, "creatinine": 1.8, "cholesterol": 220},
            "riskHistory": [{"date": "2025-09-01", "score": 0.65}, {"date": "2025-09-03", "score": 0.72}, {"date": "2025-09-05", "score": 0.75}, {"date": "2025-09-08", "score": 0.78}],
            "featureImportance": [{"factor": "Blood Pressure Variability", "importance": 0.24}, {"factor": "Medication Adherence", "importance": 0.19}, {"factor": "Age", "importance": 0.15}, {"factor": "Diabetes Control", "importance": 0.12}, {"factor": "Previous Hospitalizations", "importance": 0.10}]
        },
        {
            "id": 2,
            "name": "Michael Chen",
            "age": 54,
            "riskScore": 0.45,
            "keyFactors": ["Diabetes control", "Lifestyle factors"],
            "lastUpdated": "2025-09-08T11:15:00",
            "vitals": {"bloodPressure": {"systolic": 140, "diastolic": 85}, "heartRate": 72, "glucose": 165, "weight": 78},
            "labResults": {"hemoglobin": 12.8, "creatinine": 1.2, "cholesterol": 180},
            "riskHistory": [{"date": "2025-09-01", "score": 0.42}, {"date": "2025-09-03", "score": 0.44}, {"date": "2025-09-05", "score": 0.43}, {"date": "2025-09-08", "score": 0.45}],
            "featureImportance": [{"factor": "Glucose Control", "importance": 0.22}, {"factor": "BMI", "importance": 0.18}, {"factor": "Exercise Frequency", "importance": 0.16}, {"factor": "Diet Adherence", "importance": 0.14}, {"factor": "Sleep Quality", "importance": 0.11}]
        },
        {
            "id": 3,
            "name": "Emma Rodriguez",
            "age": 73,
            "riskScore": 0.23,
            "keyFactors": ["Stable vitals", "Good adherence"],
            "lastUpdated": "2025-09-08T09:45:00",
            "vitals": {"bloodPressure": {"systolic": 125, "diastolic": 75}, "heartRate": 68, "glucose": 110, "weight": 65},
            "labResults": {"hemoglobin": 13.5, "creatinine": 1.0, "cholesterol": 160},
            "riskHistory": [{"date": "2025-09-01", "score": 0.28}, {"date": "2025-09-03", "score": 0.25}, {"date": "2025-09-05", "score": 0.24}, {"date": "2025-09-08", "score": 0.23}],
            "featureImportance": [{"factor": "Age", "importance": 0.20}, {"factor": "Medication Adherence", "importance": 0.18}, {"factor": "Social Support", "importance": 0.15}, {"factor": "Mobility Score", "importance": 0.13}, {"factor": "Cognitive Function", "importance": 0.12}]
        },
        {
            "id": 4,
            "name": "James Wilson",
            "age": 61,
            "riskScore": 0.82,
            "keyFactors": ["Multiple comorbidities", "Recent ER visit"],
            "lastUpdated": "2025-09-08T12:00:00",
            "vitals": {"bloodPressure": {"systolic": 170, "diastolic": 100}, "heartRate": 95, "glucose": 180, "weight": 95},
            "labResults": {"hemoglobin": 10.8, "creatinine": 2.1, "cholesterol": 240},
            "riskHistory": [{"date": "2025-09-01", "score": 0.75}, {"date": "2025-09-03", "score": 0.79}, {"date": "2025-09-05", "score": 0.80}, {"date": "2025-09-08", "score": 0.82}],
            "featureImportance": [{"factor": "Recent Hospitalization", "importance": 0.28}, {"factor": "Kidney Function", "importance": 0.22}, {"factor": "Heart Failure Indicators", "importance": 0.20}, {"factor": "Polypharmacy", "importance": 0.15}, {"factor": "Frailty Score", "importance": 0.12}]
        },
        {
            "id": 5,
            "name": "Lisa Thompson",
            "age": 48,
            "riskScore": 0.35,
            "keyFactors": ["Stress levels", "Work schedule"],
            "lastUpdated": "2025-09-08T08:30:00",
            "vitals": {"bloodPressure": {"systolic": 135, "diastolic": 80}, "heartRate": 75, "glucose": 125, "weight": 70},
            "labResults": {"hemoglobin": 12.9, "creatinine": 0.9, "cholesterol": 195},
            "riskHistory": [{"date": "2025-09-01", "score": 0.32}, {"date": "2025-09-03", "score": 0.34}, {"date": "2025-09-05", "score": 0.36}, {"date": "2025-09-08", "score": 0.35}],
            "featureImportance": [{"factor": "Work Stress", "importance": 0.19}, {"factor": "Sleep Disruption", "importance": 0.17}, {"factor": "Physical Activity", "importance": 0.16}, {"factor": "Blood Pressure Trend", "importance": 0.14}, {"factor": "Family History", "importance": 0.13}]
        }
    ]
};

// Main Application Class
class ClinicalRiskDashboard {
    constructor() {
        this.state = appState;
        this.data = patientData;
        this.isInitialized = false;
    }

    // Initialize the application
    init() {
        if (this.isInitialized) {
            console.warn('Dashboard already initialized');
            return this;
        }

        try {
            this.state.patients = this.data.patients;
            this.state.filteredPatients = [...this.state.patients];
            
            this.setupEventListeners();
            this.renderPatientTable();
            
            // Initialize analytics charts with a delay to ensure DOM is ready
            setTimeout(() => {
                this.renderAnalyticsCharts();
                this.startRealTimeUpdates();
            }, 100);

            this.isInitialized = true;
            console.log('Clinical Risk Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.displayError('Failed to load the dashboard. Please refresh the page.');
        }

        return this;
    }

    // Destroy the application and clean up resources
    destroy() {
        try {
            this.cleanup();
            this.isInitialized = false;
            console.log('Clinical Risk Dashboard destroyed');
        } catch (error) {
            console.error('Error destroying dashboard:', error);
        }
    }

    setupEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', this.handleTabClick.bind(this));
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', this.handleFilterClick.bind(this));
        });

        // Search functionality
        const searchInput = document.getElementById('patient-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearchInput.bind(this), 300));
        }

        // Sorting
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(th => {
            th.addEventListener('click', this.handleSortClick.bind(this));
        });

        // Pagination
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.changePage(-1));
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.changePage(1));
        }

        // Modal controls
        this.setupModalEventListeners();
        
        // Global keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.cleanup.bind(this));

        // Make modal functions globally accessible for onclick handlers
        window.openPatientModal = this.openPatientModal.bind(this);
        window.closeModal = this.closeModal.bind(this);
    }

    handleTabClick(e) {
        const tab = e.target.dataset.tab;
        if (tab) {
            this.switchTab(tab);
        }
    }

    handleFilterClick(e) {
        const filter = e.target.dataset.filter;
        if (filter) {
            this.setFilter(filter);
            this.updateFilterButtons(e.target);
        }
    }

    handleSearchInput(e) {
        this.searchPatients(e.target.value);
    }

    handleSortClick(e) {
        const field = e.target.dataset.sort;
        if (field) {
            this.sortPatients(field);
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('patient-modal');
            if (modal && !modal.classList.contains('hidden')) {
                this.closeModal();
            }
        }
    }

    setupModalEventListeners() {
        const closeModalBtn = document.getElementById('close-modal');
        const modalOverlay = document.querySelector('.modal__overlay');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeModal();
                }
            });
        }
    }

    switchTab(tabName) {
        try {
            // Update tab buttons
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                btn.classList.toggle('tab-btn--active', btn.dataset.tab === tabName);
            });

            // Update tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.toggle('tab-content--active', content.id === `${tabName}-tab`);
            });

            // Refresh charts when switching to analytics tab
            if (tabName === 'analytics') {
                setTimeout(() => this.renderAnalyticsCharts(), 100);
            }
        } catch (error) {
            console.error('Error switching tab:', error);
        }
    }

    setFilter(filter) {
        this.state.currentFilter = filter;
        this.state.currentPage = 1;
        this.filterPatients();
        this.renderPatientTable();
    }

    updateFilterButtons(activeButton) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('filter-btn--active', btn === activeButton);
        });
    }

    filterPatients() {
        if (this.state.currentFilter === 'all') {
            this.state.filteredPatients = [...this.state.patients];
        } else {
            this.state.filteredPatients = this.state.patients.filter(patient => {
                const riskLevel = this.getRiskLevel(patient.riskScore);
                return riskLevel === this.state.currentFilter;
            });
        }
    }

    searchPatients(query) {
        try {
            if (!query || query.trim() === '') {
                this.filterPatients();
            } else {
                const searchTerm = query.toLowerCase().trim();
                this.state.filteredPatients = this.state.patients.filter(patient => {
                    const nameMatch = patient.name.toLowerCase().includes(searchTerm);
                    const factorMatch = patient.keyFactors.some(factor => 
                        factor.toLowerCase().includes(searchTerm)
                    );
                    return nameMatch || factorMatch;
                });
            }
            this.state.currentPage = 1;
            this.renderPatientTable();
        } catch (error) {
            console.error('Error searching patients:', error);
        }
    }

    sortPatients(field) {
        try {
            const direction = this.state.currentSort.field === field && this.state.currentSort.direction === 'asc' ? 'desc' : 'asc';
            this.state.currentSort = { field, direction };

            this.state.filteredPatients.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];

                if (field === 'lastUpdated') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });

            this.renderPatientTable();
            this.updateSortIndicators(field, direction);
        } catch (error) {
            console.error('Error sorting patients:', error);
        }
    }

    updateSortIndicators(field, direction) {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === field) {
                th.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.state.filteredPatients.length / this.state.patientsPerPage);
        const newPage = this.state.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.state.currentPage = newPage;
            this.renderPatientTable();
        }
    }

    renderPatientTable() {
        const tbody = document.getElementById('patient-table-body');
        if (!tbody) {
            console.warn('Patient table body not found');
            return;
        }

        try {
            const startIndex = (this.state.currentPage - 1) * this.state.patientsPerPage;
            const endIndex = startIndex + this.state.patientsPerPage;
            const patientsToShow = this.state.filteredPatients.slice(startIndex, endIndex);

            if (patientsToShow.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No patients found</td></tr>';
            } else {
                tbody.innerHTML = patientsToShow.map(patient => {
                    const riskLevel = this.getRiskLevel(patient.riskScore);
                    const riskPercentage = Math.round(patient.riskScore * 100);
                    const lastUpdated = this.formatDate(patient.lastUpdated);

                    return `
                        <tr onclick="openPatientModal(${patient.id})" style="cursor: pointer;" role="button" tabindex="0">
                            <td><strong>${this.escapeHtml(patient.name)}</strong></td>
                            <td>${patient.age}</td>
                            <td>
                                <span class="risk-score risk-score--${riskLevel}">
                                    ${riskPercentage}%
                                </span>
                            </td>
                            <td>
                                <div class="key-factors">
                                    ${patient.keyFactors.map(factor => 
                                        `<span class="factor-tag">${this.escapeHtml(factor)}</span>`
                                    ).join('')}
                                </div>
                            </td>
                            <td>${lastUpdated}</td>
                            <td>
                                <button class="btn btn--primary action-btn" onclick="event.stopPropagation(); openPatientModal(${patient.id})" aria-label="View details for ${this.escapeHtml(patient.name)}">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            this.updatePaginationInfo();
        } catch (error) {
            console.error('Error rendering patient table:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-error">Error loading patient data</td></tr>';
        }
    }

    updatePaginationInfo() {
        const totalPages = Math.ceil(this.state.filteredPatients.length / this.state.patientsPerPage) || 1;
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        
        if (currentPageEl) currentPageEl.textContent = this.state.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
        
        if (prevPageBtn) prevPageBtn.disabled = this.state.currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = this.state.currentPage >= totalPages;
    }

    openPatientModal(patientId) {
        try {
            const patient = this.state.patients.find(p => p.id === patientId);
            if (!patient) {
                console.error('Patient not found:', patientId);
                return;
            }

            this.state.selectedPatient = patient;
            this.renderPatientModal(patient);
            
            const modal = document.getElementById('patient-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.setAttribute('tabindex', '-1');
                modal.focus();
            }
        } catch (error) {
            console.error('Error opening patient modal:', error);
            this.displayError('Failed to load patient details');
        }
    }

    closeModal() {
        try {
            const modal = document.getElementById('patient-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            this.state.selectedPatient = null;
            
            // Cleanup modal charts
            this.destroyModalCharts();
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    destroyModalCharts() {
        if (this.state.charts.riskTrend) {
            this.state.charts.riskTrend.destroy();
            this.state.charts.riskTrend = null;
        }
        if (this.state.charts.featureImportance) {
            this.state.charts.featureImportance.destroy();
            this.state.charts.featureImportance = null;
        }
    }

    renderPatientModal(patient) {
        try {
            // Update patient details
            this.updateModalPatientInfo(patient);
            this.updateModalRiskScore(patient);
            this.renderVitals(patient.vitals);
            this.renderLabResults(patient.labResults);
            this.renderRecommendedActions(patient);
            this.renderAlerts(patient);
            
            // Render charts with delay to ensure modal is rendered
            setTimeout(() => {
                if (patient.riskHistory) this.renderRiskTrendChart(patient.riskHistory);
                if (patient.featureImportance) this.renderFeatureImportanceChart(patient.featureImportance);
            }, 150);
        } catch (error) {
            console.error('Error rendering patient modal:', error);
            this.displayError('Failed to load patient details');
        }
    }

    updateModalPatientInfo(patient) {
        const elements = {
            modalPatientName: document.getElementById('modal-patient-name'),
            patientNameDetail: document.getElementById('patient-name-detail'),
            patientAgeDetail: document.getElementById('patient-age-detail'),
            patientUpdatedDetail: document.getElementById('patient-updated-detail')
        };
        
        if (elements.modalPatientName) {
            elements.modalPatientName.textContent = `${patient.name} - Risk Assessment`;
        }
        if (elements.patientNameDetail) {
            elements.patientNameDetail.textContent = patient.name;
        }
        if (elements.patientAgeDetail) {
            elements.patientAgeDetail.textContent = patient.age;
        }
        if (elements.patientUpdatedDetail) {
            elements.patientUpdatedDetail.textContent = this.formatDate(patient.lastUpdated);
        }
    }

    updateModalRiskScore(patient) {
        const riskLevel = this.getRiskLevel(patient.riskScore);
        const riskPercentage = Math.round(patient.riskScore * 100);
        const riskCircle = document.getElementById('risk-score-circle');
        const riskValue = document.getElementById('risk-score-value');
        
        if (riskCircle) {
            riskCircle.className = `risk-score-circle risk-score-circle--${riskLevel}`;
        }
        if (riskValue) {
            riskValue.textContent = `${riskPercentage}%`;
        }
    }

    renderVitals(vitals) {
        const vitalsGrid = document.getElementById('vitals-grid');
        if (!vitalsGrid || !vitals) return;

        vitalsGrid.innerHTML = `
            <div class="vital-item">
                <span class="vital-label">Blood Pressure</span>
                <span class="vital-value ${vitals.bloodPressure?.systolic > 140 ? 'vital-value--high' : 'vital-value--normal'}">
                    ${vitals.bloodPressure ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}` : 'N/A'} mmHg
                </span>
            </div>
            <div class="vital-item">
                <span class="vital-label">Heart Rate</span>
                <span class="vital-value ${vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 60) ? 'vital-value--high' : 'vital-value--normal'}">
                    ${vitals.heartRate || 'N/A'} bpm
                </span>
            </div>
            <div class="vital-item">
                <span class="vital-label">Glucose</span>
                <span class="vital-value ${vitals.glucose > 140 ? 'vital-value--high' : 'vital-value--normal'}">
                    ${vitals.glucose || 'N/A'} mg/dL
                </span>
            </div>
            <div class="vital-item">
                <span class="vital-label">Weight</span>
                <span class="vital-value vital-value--normal">${vitals.weight || 'N/A'} kg</span>
            </div>
        `;
    }

    renderLabResults(labResults) {
        const labsGrid = document.getElementById('labs-grid');
        if (!labsGrid || !labResults) return;

        labsGrid.innerHTML = `
            <div class="lab-item">
                <span class="lab-label">Hemoglobin</span>
                <span class="lab-value ${labResults.hemoglobin < 12 ? 'lab-value--low' : 'lab-value--normal'}">
                    ${labResults.hemoglobin || 'N/A'} g/dL
                </span>
            </div>
            <div class="lab-item">
                <span class="lab-label">Creatinine</span>
                <span class="lab-value ${labResults.creatinine > 1.3 ? 'lab-value--high' : 'lab-value--normal'}">
                    ${labResults.creatinine || 'N/A'} mg/dL
                </span>
            </div>
            <div class="lab-item">
                <span class="lab-label">Cholesterol</span>
                <span class="lab-value ${labResults.cholesterol > 200 ? 'lab-value--high' : 'lab-value--normal'}">
                    ${labResults.cholesterol || 'N/A'} mg/dL
                </span>
            </div>
        `;
    }

    renderRecommendedActions(patient) {
        const riskLevel = this.getRiskLevel(patient.riskScore);
        const actions = this.state.clinicalActions[riskLevel] || [];
        const actionsList = document.getElementById('actions-list');
        
        if (!actionsList) return;
        
        if (actions.length === 0) {
            actionsList.innerHTML = '<p class="no-actions">No specific actions recommended</p>';
            return;
        }
        
        actionsList.innerHTML = actions.map((action, index) => `
            <div class="action-item">
                <div class="action-icon">${index + 1}</div>
                <span class="action-text">${this.escapeHtml(action)}</span>
            </div>
        `).join('');
    }

    renderAlerts(patient) {
        const alerts = this.generateAlerts(patient);
        const alertsList = document.getElementById('alerts-list');
        
        if (!alertsList) return;
        
        if (alerts.length === 0) {
            alertsList.innerHTML = '<p class="alert-item alert-item--info">No active alerts</p>';
            return;
        }
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-item--${alert.severity}" role="alert">
                <div class="alert-icon alert-icon--${alert.severity}" aria-hidden="true">!</div>
                <div class="alert-content">
                    <h5 class="alert-title">${this.escapeHtml(alert.title)}</h5>
                    <p class="alert-description">${this.escapeHtml(alert.description)}</p>
                </div>
            </div>
        `).join('');
    }

    generateAlerts(patient) {
        const alerts = [];
        
        try {
            // Critical risk alert
            if (patient.riskScore > 0.7) {
                alerts.push({
                    severity: 'critical',
                    title: 'Critical Risk Level',
                    description: 'Patient requires immediate clinical attention'
                });
            }
            
            // High blood pressure alert
            if (patient.vitals?.bloodPressure?.systolic > 160) {
                alerts.push({
                    severity: 'warning',
                    title: 'Elevated Blood Pressure',
                    description: `Systolic BP: ${patient.vitals.bloodPressure.systolic} mmHg - Consider medication adjustment`
                });
            }
            
            // High glucose alert
            if (patient.vitals?.glucose > 160) {
                alerts.push({
                    severity: 'warning',
                    title: 'Elevated Glucose',
                    description: `Glucose: ${patient.vitals.glucose} mg/dL - Review diabetes management`
                });
            }
            
            // Lab value alerts
            if (patient.labResults?.creatinine > 1.8) {
                alerts.push({
                    severity: 'warning',
                    title: 'Kidney Function Alert',
                    description: `Creatinine: ${patient.labResults.creatinine} mg/dL - Monitor renal function`
                });
            }
        } catch (error) {
            console.error('Error generating alerts:', error);
        }
        
        return alerts;
    }

    renderRiskTrendChart(riskHistory) {
        const ctx = document.getElementById('risk-trend-chart');
        if (!ctx) return;
        
        try {
            const chartCtx = ctx.getContext('2d');
            
            // Destroy existing chart
            if (this.state.charts.riskTrend) {
                this.state.charts.riskTrend.destroy();
            }
            
            this.state.charts.riskTrend = new ChartJS(chartCtx, {
                type: 'line',
                data: {
                    labels: riskHistory.map(item => this.formatDateShort(item.date)),
                    datasets: [{
                        label: 'Risk Score',
                        data: riskHistory.map(item => Math.round(item.score * 100)),
                        backgroundColor: '#1FB8CD20',
                        borderColor: '#1FB8CD',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#1FB8CD',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `Risk Score: ${context.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            },
                            grid: {
                                color: '#e5e5e5'
                            }
                        },
                        x: {
                            grid: {
                                color: '#e5e5e5'
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering risk trend chart:', error);
        }
    }

    renderFeatureImportanceChart(featureImportance) {
        const ctx = document.getElementById('feature-importance-chart');
        if (!ctx) return;
        
        try {
            const chartCtx = ctx.getContext('2d');
            
            // Destroy existing chart
            if (this.state.charts.featureImportance) {
                this.state.charts.featureImportance.destroy();
            }
            
            this.state.charts.featureImportance = new ChartJS(chartCtx, {
                type: 'bar',
                data: {
                    labels: featureImportance.map(item => item.factor),
                    datasets: [{
                        label: 'Importance',
                        data: featureImportance.map(item => Math.round(item.importance * 100)),
                        backgroundColor: [
                            '#1FB8CD',
                            '#FFC185',
                            '#B4413C',
                            '#ECEBD5',
                            '#5D878F'
                        ],
                        borderWidth: 0,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Importance: ${context.parsed.x}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 30,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            },
                            grid: {
                                color: '#e5e5e5'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering feature importance chart:', error);
        }
    }

    renderAnalyticsCharts() {
        try {
            this.renderRiskDistributionChart();
            this.renderAgeRiskChart();
        } catch (error) {
            console.error('Error rendering analytics charts:', error);
        }
    }

    renderRiskDistributionChart() {
        const ctx = document.getElementById('risk-distribution-chart');
        if (!ctx) return;
        
        try {
            const chartCtx = ctx.getContext('2d');
            
            // Destroy existing chart
            if (this.state.charts.riskDistribution) {
                this.state.charts.riskDistribution.destroy();
            }
            
            const riskCounts = {
                low: this.state.patients.filter(p => this.getRiskLevel(p.riskScore) === 'low').length,
                medium: this.state.patients.filter(p => this.getRiskLevel(p.riskScore) === 'medium').length,
                high: this.state.patients.filter(p => this.getRiskLevel(p.riskScore) === 'high').length
            };
            
            this.state.charts.riskDistribution = new ChartJS(chartCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                    datasets: [{
                        data: [riskCounts.low, riskCounts.medium, riskCounts.high],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((context.parsed / total) * 100);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering risk distribution chart:', error);
        }
    }

    renderAgeRiskChart() {
        const ctx = document.getElementById('age-risk-chart');
        if (!ctx) return;
        
        try {
            const chartCtx = ctx.getContext('2d');
            
            // Destroy existing chart
            if (this.state.charts.ageRisk) {
                this.state.charts.ageRisk.destroy();
            }
            
            const ageGroups = {
                '40-50': [],
                '50-60': [],
                '60-70': [],
                '70+': []
            };
            
            this.state.patients.forEach(patient => {
                if (patient.age < 50) {
                    ageGroups['40-50'].push(patient.riskScore);
                } else if (patient.age < 60) {
                    ageGroups['50-60'].push(patient.riskScore);
                } else if (patient.age < 70) {
                    ageGroups['60-70'].push(patient.riskScore);
                } else {
                    ageGroups['70+'].push(patient.riskScore);
                }
            });
            
            const averageRisks = Object.keys(ageGroups).map(group => {
                const scores = ageGroups[group];
                if (scores.length === 0) return 0;
                const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                return Math.round(avg * 100);
            });
            
            this.state.charts.ageRisk = new ChartJS(chartCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(ageGroups),
                    datasets: [{
                        label: 'Average Risk Score (%)',
                        data: averageRisks,
                        backgroundColor: '#1FB8CD',
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Average Risk: ${context.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            },
                            grid: {
                                color: '#e5e5e5'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering age risk chart:', error);
        }
    }

    startRealTimeUpdates() {
        // Clear existing interval if it exists
        if (this.state.updateInterval) {
            clearInterval(this.state.updateInterval);
        }
        
        this.state.updateInterval = setInterval(() => {
            try {
                this.updatePatientRiskScores();
                this.refreshDisplays();
            } catch (error) {
                console.error('Error in real-time update:', error);
            }
        }, 10000); // Update every 10 seconds
    }

    updatePatientRiskScores() {
        this.state.patients.forEach(patient => {
            // Simulate small random changes in risk scores
            const change = (Math.random() - 0.5) * 0.02;
            patient.riskScore = Math.max(0, Math.min(1, patient.riskScore + change));
            
            // Update timestamp
            patient.lastUpdated = new Date().toISOString();
            
            // Update risk history (keep last 10 entries)
            if (patient.riskHistory) {
                patient.riskHistory.push({
                    date: patient.lastUpdated,
                    score: patient.riskScore
                });
                
                // Keep only the last 10 entries
                if (patient.riskHistory.length > 10) {
                    patient.riskHistory = patient.riskHistory.slice(-10);
                }
            }
        });
    }

    refreshDisplays() {
        // Update patient table if on cohort view
        const cohortTab = document.getElementById('cohort-tab');
        if (cohortTab?.classList.contains('tab-content--active')) {
            this.filterPatients();
            this.renderPatientTable();
        }
        
        // Update analytics charts if on analytics view
        const analyticsTab = document.getElementById('analytics-tab');
        if (analyticsTab?.classList.contains('tab-content--active')) {
            this.renderAnalyticsCharts();
        }
        
        // Update modal if open
        const modal = document.getElementById('patient-modal');
        if (this.state.selectedPatient && modal && !modal.classList.contains('hidden')) {
            const updatedPatient = this.state.patients.find(p => p.id === this.state.selectedPatient.id);
            if (updatedPatient) {
                this.updateModalRiskScore(updatedPatient);
                // Update risk trend chart with new data
                if (updatedPatient.riskHistory) {
                    this.renderRiskTrendChart(updatedPatient.riskHistory);
                }
            }
        }
    }

    // Utility methods
    getRiskLevel(riskScore) {
        if (riskScore < this.state.riskThresholds.low) return 'low';
        if (riskScore < this.state.riskThresholds.medium) return 'medium';
        return 'high';
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    formatDateShort(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid';
        }
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    displayError(message) {
        console.error('Application Error:', message);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #B4413C;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    cleanup() {
        // Clear intervals
        if (this.state.updateInterval) {
            clearInterval(this.state.updateInterval);
        }
        
        // Destroy all charts
        Object.values(this.state.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });

        // Remove global functions
        if (window.openPatientModal) {
            delete window.openPatientModal;
        }
        if (window.closeModal) {
            delete window.closeModal;
        }
    }

    // Public API methods
    getPatients() {
        return [...this.state.patients];
    }

    getFilteredPatients() {
        return [...this.state.filteredPatients];
    }

    getCurrentFilter() {
        return this.state.currentFilter;
    }

    getSelectedPatient() {
        return this.state.selectedPatient;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!window.clinicalDashboard) {
        window.clinicalDashboard = new ClinicalRiskDashboard().init();
    }
});

// Export the dashboard class as default
export default ClinicalRiskDashboard;

// Also export a factory function for convenience
export function createDashboard() {
    return new ClinicalRiskDashboard();
}

// Export individual components for advanced usage
export { appState, patientData };
