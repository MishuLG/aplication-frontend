import React, { useState, useEffect } from 'react';
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CProgress,
    CButtonGroup,
    CButton,
    useColorModes
} from '@coreui/react';
import { CChart } from '@coreui/react-chartjs';
import CIcon from '@coreui/icons-react';
import { 
    cilPeople, 
    cilUser, 
    cilCheckCircle, 
    cilTask, 
    cilArrowTop, 
    cilArrowBottom
} from '@coreui/icons';

import API_URL from '../../../config'; 
import '../../css/dashboard.css'; 

const getToken = () => localStorage.getItem('token');

const Dashboard = () => {
    
    // Detección de tema para los colores internos de la GRÁFICA (Chart.js no usa CSS)
    const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
    const isDark = colorMode === 'dark' || (colorMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Colores de la gráfica sincronizados con CoreUI
    const chartGridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const chartTextColor = isDark ? '#b1b7c1' : '#768192';

    const [stats, setStats] = useState({ students: 0, studentGrowth: 0, users: 0, attendanceVal: "0%", evaluations: 0 });
    const [rawChartData, setRawChartData] = useState({ daily: [], monthly: [] });
    const [filter, setFilter] = useState('6M'); 
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [attendanceChart, setAttendanceChart] = useState({ labels: [], data: [] });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`${API_URL}/dashboard`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats({
                    students: data.kpi.students,
                    studentGrowth: parseFloat(data.kpi.studentGrowth || 0),
                    users: data.kpi.users,
                    attendanceVal: data.kpi.attendance,
                    evaluations: data.kpi.evaluations
                });
                setRawChartData({
                    daily: data.charts.registrationsDaily || [],
                    monthly: data.charts.registrationsMonthly || []
                });
                const attData = data.charts.attendance || [];
                setAttendanceChart({
                    labels: attData.length > 0 ? attData.map(i => {
                        const d = new Date(i.day);
                        d.setDate(d.getDate() + 1);
                        return d.toLocaleDateString('es-ES', { weekday: 'short' });
                    }) : ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
                    data: attData.length > 0 ? attData.map(i => parseInt(i.value)) : [0, 0, 0, 0, 0]
                });
            }
        } catch (error) { console.error("Error dashboard:", error); }
    };

    useEffect(() => {
        let labels = [], values = [], labelText = '';
        if (filter === '1M') {
            labelText = 'Estudiantes (Últimos 30 días)';
            const data = rawChartData.daily; 
            labels = data.map(d => d.date.slice(5)); 
            values = data.map(d => parseInt(d.count));
        } else if (filter === '6M') {
            labelText = 'Estudiantes (Últimos 6 meses)';
            const data = rawChartData.monthly.slice(-6); 
            labels = data.map(d => d.month);
            values = data.map(d => parseInt(d.count));
        } else if (filter === '1Y') {
            labelText = 'Estudiantes (Último año)';
            const data = rawChartData.monthly.slice(-12); 
            labels = data.map(d => d.month);
            values = data.map(d => parseInt(d.count));
        }
        setChartData({
            labels: labels.length > 0 ? labels : ['Sin datos'], 
            datasets: [{
                label: labelText,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 5,
                hoverBackgroundColor: '#4338ca',
                data: values.length > 0 ? values : [0], 
                barPercentage: 0.6 
            }],
        });
    }, [filter, rawChartData]); 

    // Tarjeta KPI usando clases estándar
    const StatCard = ({ title, value, icon, gradient, percent, isIncrease }) => (
        <CCard className="minimal-card mb-4">
            <div className="stat-card-body">
                <div className="stat-content">
                    <h4 className="text-medium-emphasis">{title}</h4>
                    <div className="value">{value}</div>
                    <div className={`mt-2 small fw-bold ${isIncrease ? 'text-success' : 'text-danger'}`}>
                        <CIcon icon={isIncrease ? cilArrowTop : cilArrowBottom} size="sm" />
                        <span className="ms-1">{Math.abs(percent)}%</span>
                        <span className="text-muted fw-normal ms-1">vs mes pasado</span>
                    </div>
                </div>
                <div className={`stat-icon-wrapper ${gradient}`}>
                    <CIcon icon={icon} />
                </div>
            </div>
        </CCard>
    );

    return (
        <CContainer fluid className="mt-4">
            <CRow className="tour-dashboard-kpi">
                <CCol sm={6} lg={3}><StatCard title="Total Estudiantes" value={stats.students} icon={cilPeople} gradient="bg-gradient-primary" percent={stats.studentGrowth} isIncrease={stats.studentGrowth >= 0} /></CCol>
                <CCol sm={6} lg={3}><StatCard title="Usuarios Activos" value={stats.users} icon={cilUser} gradient="bg-gradient-info" percent={4.2} isIncrease={true} /></CCol>
                <CCol sm={6} lg={3}><StatCard title="Asistencia Global" value={stats.attendanceVal} icon={cilCheckCircle} gradient="bg-gradient-success" percent={1.8} isIncrease={true} /></CCol>
                <CCol sm={6} lg={3}><StatCard title="Evaluaciones" value={stats.evaluations} icon={cilTask} gradient="bg-gradient-warning" percent={2.5} isIncrease={false} /></CCol>
            </CRow>

            <CRow>
                <CCol xs={12} lg={8} className="mb-4">
                    <CCard className="minimal-card h-100">
                        <CCardHeader className="minimal-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Registro de Estudiantes</h5>
                            <CButtonGroup role="group">
                                <CButton color="primary" variant={filter === '1M' ? undefined : 'outline'} size="sm" onClick={() => setFilter('1M')}>1 Mes</CButton>
                                <CButton color="primary" variant={filter === '6M' ? undefined : 'outline'} size="sm" onClick={() => setFilter('6M')}>6 Meses</CButton>
                                <CButton color="primary" variant={filter === '1Y' ? undefined : 'outline'} size="sm" onClick={() => setFilter('1Y')}>1 Año</CButton>
                            </CButtonGroup>
                        </CCardHeader>
                        <CCardBody className="p-4">
                            <CChart type="bar" data={chartData} options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: chartTextColor } }, y: { grid: { borderDash: [5, 5], color: chartGridColor }, ticks: { stepSize: 1, color: chartTextColor } } }, maintainAspectRatio: false, animation: { duration: 800 } }} style={{ height: '300px' }} /> 
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol xs={12} lg={4} className="mb-4">
                    <CCard className="minimal-card mb-4 h-100">
                        <CCardHeader className="minimal-header"><h5>Tendencia Asistencia</h5></CCardHeader>
                        <CCardBody className="p-4 d-flex flex-column justify-content-between">
                            <CChart type="line" data={{ labels: attendanceChart.labels, datasets: [{ label: '% Asistencia', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981', pointBackgroundColor: isDark ? '#2a2e39' : '#fff', pointBorderColor: '#10b981', pointRadius: 4, data: attendanceChart.data, fill: true, tension: 0.4 }] }} options={{ plugins: { legend: { display: false } }, scales: { x: { display: true, grid: { display: false }, ticks: { color: chartTextColor } }, y: { display: false, min: 0, max: 100 } }, layout: { padding: 10 }, animation: { duration: 1000, easing: 'easeOutQuart' }, maintainAspectRatio: false }} style={{ height: '200px' }} />
                             <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2 small fw-bold text-medium-emphasis"><span>Meta Semanal</span><span>100%</span></div>
                                <CProgress thin color="success" value={96} style={{height: '6px', borderRadius: '10px'}} />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
};

export default Dashboard;