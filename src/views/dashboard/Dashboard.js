import React, { useState, useEffect } from 'react';
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CCarousel,
    CCarouselItem,
    CImage,
    CCarouselCaption,
    CProgress
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

// Helper para obtener token
const getToken = () => localStorage.getItem('token');

// Imágenes estáticas
const imagen1 = '/img/73dd40dc057fbb426a0f758bcd442c96.jpg';
const imagen2 = '/img/back-to-school-2629361.jpg';

const Dashboard = () => {
    
    // ESTADO ÚNICO PARA TODOS LOS DATOS
    const [stats, setStats] = useState({
        students: 0,
        users: 0,
        attendanceVal: "0%",
        evaluations: 0
    });

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    const [attendanceChart, setAttendanceChart] = useState({
        labels: [],
        data: []
    });

    // CARGA DE DATOS REALES
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${API_URL}/dashboard`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // 1. Actualizar KPIs
                    setStats({
                        students: data.kpi.students,
                        users: data.kpi.users,
                        attendanceVal: data.kpi.attendance,
                        evaluations: data.kpi.evaluations
                    });

                    // 2. Gráfica de Barras (Registro de Estudiantes)
                    const regData = data.charts.registrations || [];
                    const labels = regData.map(item => item.month); 
                    const values = regData.map(item => parseInt(item.count)); 

                    setChartData({
                        labels: labels.length > 0 ? labels : ['Sin datos'], 
                        datasets: [{
                            label: 'Nuevos Estudiantes',
                            backgroundColor: 'rgba(79, 70, 229, 0.8)',
                            borderRadius: 5,
                            hoverBackgroundColor: '#4338ca',
                            data: values.length > 0 ? values : [0], 
                            barPercentage: 0.6 
                        }],
                    });

                    // 3. Gráfica de Línea (Asistencia)
                    const attData = data.charts.attendance || [];
                    setAttendanceChart({
                        labels: attData.length > 0 ? attData.map(i => i.day) : ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
                        data: attData.length > 0 ? attData.map(i => parseInt(i.value)) : [0, 0, 0, 0, 0]
                    });
                }
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            }
        };

        fetchDashboardData();
    }, []); 

    // COMPONENTE TARJETA
    const StatCard = ({ title, value, icon, gradient, percent, isIncrease }) => (
        <CCard className="minimal-card mb-4">
            <div className="stat-card-body">
                <div className="stat-content">
                    <h4>{title}</h4>
                    <div className="value">{value}</div>
                    <div className={`mt-2 small fw-bold ${isIncrease ? 'text-success' : 'text-danger'}`}>
                        <CIcon icon={isIncrease ? cilArrowTop : cilArrowBottom} size="sm" />
                        <span className="ms-1">{percent}%</span>
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
            
            <CRow>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Total Estudiantes" 
                        value={stats.students} 
                        icon={cilPeople} 
                        gradient="bg-gradient-primary"
                        percent="12.5" 
                        isIncrease={true} 
                    />
                </CCol>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Usuarios Activos" 
                        value={stats.users} 
                        icon={cilUser} 
                        gradient="bg-gradient-info"
                        percent="4.2" 
                        isIncrease={true} 
                    />
                </CCol>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Asistencia Global" 
                        value={stats.attendanceVal} 
                        icon={cilCheckCircle} 
                        gradient="bg-gradient-success"
                        percent="1.8" 
                        isIncrease={true} 
                    />
                </CCol>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Evaluaciones" 
                        value={stats.evaluations} 
                        icon={cilTask} 
                        gradient="bg-gradient-warning"
                        percent="2.5" 
                        isIncrease={false} 
                    />
                </CCol>
            </CRow>

            <CRow>
                {/* GRÁFICO DE BARRAS DINÁMICO */}
                <CCol xs={12} lg={8} className="mb-4">
                    <CCard className="minimal-card h-100">
                        <CCardHeader className="minimal-header d-flex justify-content-between align-items-center">
                            <h5>Registro de Estudiantes</h5>
                            <small className="text-muted">Últimos 6 meses</small>
                        </CCardHeader>
                        <CCardBody className="p-4">
                            <CChart 
                                type="bar" 
                                data={chartData} 
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { grid: { display: false } },
                                        y: { 
                                            grid: { borderDash: [5, 5], color: '#f3f4f6' },
                                            ticks: { stepSize: 1 } // Pasos enteros
                                        } 
                                    },
                                    maintainAspectRatio: false
                                }}
                                style={{ height: '300px' }} 
                            /> 
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* PANEL LATERAL */}
                <CCol xs={12} lg={4} className="mb-4">
                    <CCard className="minimal-card mb-4">
                        <CCardHeader className="minimal-header">
                            <h5>Tendencia Asistencia</h5>
                        </CCardHeader>
                        <CCardBody className="p-4">
                            <CChart 
                                type="line" 
                                data={{
                                    labels: attendanceChart.labels,
                                    datasets: [{
                                        label: 'Asistencia',
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        borderColor: '#10b981',
                                        pointBackgroundColor: '#fff',
                                        pointBorderColor: '#10b981',
                                        pointRadius: 4,
                                        data: attendanceChart.data,
                                        fill: true,
                                        tension: 0.4
                                    }]
                                }}
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: { x: { display: false }, y: { display: false } },
                                    layout: { padding: 10 }
                                }}
                                style={{ height: '120px' }}
                            />
                             <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2 small fw-bold text-muted">
                                    <span>Meta Semanal</span>
                                    <span>100%</span>
                                </div>
                                <CProgress thin color="success" value={96} style={{height: '6px', borderRadius: '10px'}} />
                            </div>
                        </CCardBody>
                    </CCard>

                    <CCard className="minimal-card border-0">
                        <CCarousel controls indicators interval={5000} transition="crossfade">
                            <CCarouselItem>
                                <CImage className="d-block w-100 rounded-bottom-4" src={imagen1} alt="Slide 1" style={{height: '220px', objectFit: 'cover', borderRadius: '20px'}} />
                            </CCarouselItem>
                            <CCarouselItem>
                                <CImage className="d-block w-100 rounded-bottom-4" src={imagen2} alt="Slide 2" style={{height: '220px', objectFit: 'cover', borderRadius: '20px'}} />
                            </CCarouselItem>
                        </CCarousel>
                    </CCard>
                </CCol>
            </CRow>
            
        </CContainer>
    );
};

export default Dashboard;