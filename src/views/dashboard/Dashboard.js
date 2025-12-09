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

// Importamos la configuración global en lugar de hardcodear localhost
import API_URL from '../../../config'; 

// Imágenes de ejemplo (Asegúrate de que estas rutas sean correctas en tu carpeta public)
const imagen1 = '/img/73dd40dc057fbb426a0f758bcd442c96.jpg';
const imagen2 = '/img/back-to-school-2629361.jpg';
// Placeholder si no tienes una 3ra imagen
const imagen3 = 'https://via.placeholder.com/800x400?text=Sistema+Escolar'; 

const Dashboard = () => {
    
    // Estados de Datos
    const [totalStudents, setTotalStudents] = useState(0); 
    const [totalUsers, setTotalUsers] = useState(0); 
    const [studentRegistrationsData, setStudentRegistrationsData] = useState({
        labels: [],
        datasets: []
    });

    // --- FUNCIONES DE CARGA DE DATOS ---

    const fetchTotalStudents = async () => {
        try {
            const response = await fetch(`${API_URL}/students`); 
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) setTotalStudents(data.length); 
            }
        } catch (error) { console.error("Error estudiantes:", error); }
    };

    const fetchTotalUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`); // Asumiendo endpoint de usuarios
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) setTotalUsers(data.length);
            }
        } catch (error) { console.error("Error usuarios:", error); }
    };

    const fetchStudentRegistrations = async () => {
        // Simulamos datos para el gráfico si el backend no devuelve la estructura exacta aún
        // En producción, descomenta tu fetch original y ajusta.
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const data = [10, 25, 15, 30, 45, 50]; 

        setStudentRegistrationsData({
            labels: labels, 
            datasets: [{
                label: 'Estudiantes',
                backgroundColor: '#321fdb', // Azul primario minimalista
                borderColor: '#321fdb',
                borderWidth: 1,
                data: data, 
                barPercentage: 0.5 
            }],
        });
    };

    useEffect(() => {
        fetchTotalStudents(); 
        fetchTotalUsers(); 
        fetchStudentRegistrations(); 
    }, []); 

    // --- COMPONENTE INTERNO: TARJETA DE ESTADÍSTICA MINIMALISTA ---
    const StatCard = ({ title, value, icon, color, percent, isIncrease }) => (
        <CCard className={`mb-4 border-start-4 border-start-${color} shadow-sm`}>
            <CCardBody className="p-4 d-flex justify-content-between align-items-center">
                <div>
                    <div className="text-medium-emphasis small text-uppercase fw-semibold">
                        {title}
                    </div>
                    <div className="fs-2 fw-semibold text-dark">
                        {value}
                    </div>
                    <div className={`small ${isIncrease ? 'text-success' : 'text-danger'} mt-1`}>
                        <CIcon icon={isIncrease ? cilArrowTop : cilArrowBottom} size="sm"/> 
                        <span className="ms-1 fw-semibold">{percent}%</span> 
                        <span className="text-medium-emphasis ms-1">vs mes anterior</span>
                    </div>
                </div>
                <div className={`bg-${color} text-white p-3 rounded-3`}>
                    <CIcon icon={icon} size="xl" />
                </div>
            </CCardBody>
        </CCard>
    );

    return (
        <CContainer fluid className="mt-4">
            
            {/* --- SECCIÓN DE ESTADÍSTICAS (KPIs) --- */}
            <CRow>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Total Estudiantes" 
                        value={totalStudents} 
                        icon={cilPeople} 
                        color="primary" 
                        percent="12.5" 
                        isIncrease={true} 
                    />
                </CCol>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Usuarios Activos" 
                        value={totalUsers} 
                        icon={cilUser} 
                        color="info" 
                        percent="4.2" 
                        isIncrease={true} 
                    />
                </CCol>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Asistencia Promedio" 
                        value="95.4%" 
                        icon={cilCheckCircle} 
                        color="success" 
                        percent="1.8" 
                        isIncrease={true} 
                    />
                </CCol>
                <CCol sm={6} lg={3}>
                    <StatCard 
                        title="Evaluaciones Pend." 
                        value="12" 
                        icon={cilTask} 
                        color="warning" 
                        percent="2.5" 
                        isIncrease={false} 
                    />
                </CCol>
            </CRow>

            {/* --- SECCIÓN DE GRÁFICAS --- */}
            <CRow>
                {/* Gráfico Principal: Crecimiento Estudiantil */}
                <CCol xs={12} lg={8} className="mb-4">
                    <CCard className="h-100 shadow-sm border-0">
                        <CCardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center mt-2">
                            <h5 className="mb-0 text-dark">Registro de Estudiantes</h5>
                            <small className="text-medium-emphasis">Últimos 6 meses</small>
                        </CCardHeader>
                        <CCardBody>
                            <CChart 
                                type="bar" 
                                data={studentRegistrationsData} 
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { grid: { display: false } },
                                        y: { grid: { borderDash: [5, 5] } } // Líneas punteadas minimalistas
                                    },
                                    maintainAspectRatio: false
                                }}
                                style={{ height: '300px' }} 
                            /> 
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* Gráfico Secundario / Panel Lateral: Asistencia */}
                <CCol xs={12} lg={4} className="mb-4">
                    <CCard className="shadow-sm border-0 mb-4">
                        <CCardHeader className="bg-transparent border-0 mt-2">
                            <h5 className="mb-0 text-dark">Tendencia de Asistencia</h5>
                        </CCardHeader>
                        <CCardBody>
                            <CChart 
                                type="line" 
                                data={{
                                    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
                                    datasets: [{
                                        label: 'Asistencia',
                                        backgroundColor: 'rgba(46, 184, 92, 0.2)',
                                        borderColor: '#2eb85c',
                                        pointBackgroundColor: '#2eb85c',
                                        data: [90, 95, 98, 92, 96],
                                        fill: true
                                    }]
                                }}
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: { x: { display: false }, y: { display: false } }, // Gráfico limpio sin ejes
                                    elements: { line: { tension: 0.4 } } // Curvas suaves
                                }}
                                style={{ height: '150px' }}
                            />
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-medium-emphasis">Meta Semanal</span>
                                    <span className="fw-semibold">96%</span>
                                </div>
                                <CProgress thin color="success" value={96} />
                            </div>
                        </CCardBody>
                    </CCard>

                    {/* Carousel pequeño */}
                    <CCard className="shadow-sm border-0 overflow-hidden">
                        <CCarousel controls indicators interval={5000} transition="crossfade">
                            <CCarouselItem>
                                <CImage className="d-block w-100" src={imagen1} alt="Slide 1" style={{height: '200px', objectFit: 'cover'}} />
                                <CCarouselCaption className="d-none d-md-block bg-dark bg-opacity-50 p-2 rounded">
                                    <h6>Gestión Escolar</h6>
                                </CCarouselCaption>
                            </CCarouselItem>
                            <CCarouselItem>
                                <CImage className="d-block w-100" src={imagen2} alt="Slide 2" style={{height: '200px', objectFit: 'cover'}} />
                                <CCarouselCaption className="d-none d-md-block bg-dark bg-opacity-50 p-2 rounded">
                                    <h6>Monitoreo</h6>
                                </CCarouselCaption>
                            </CCarouselItem>
                        </CCarousel>
                    </CCard>
                </CCol>
            </CRow>
            
        </CContainer>
    );
};

export default Dashboard;