import React, { useState, useEffect } from 'react';
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CWidgetStatsA, 
    CCarousel, 
    CCarouselItem, 
    CImage, 
    CCarouselCaption
} from '@coreui/react';
import { CChart } from '@coreui/react-chartjs'; 

const API_URL = 'http://localhost:4000/api'; 

const imagen1 = 'public/img/73dd40dc057fbb426a0f758bcd442c96.jpg';
const imagen2 = 'public/img/back-to-school-2629361.jpg';
const imagen3 = 'ruta/a/imagen3.jpg';


const Dashboard = () => {
    
    const [totalStudents, setTotalStudents] = useState(0); 
    const [totalUsers, setTotalUsers] = useState(0); 
    const [studentRegistrationsData, setStudentRegistrationsData] = useState({
        labels: [],
        datasets: []
    });
    

    const fetchTotalStudents = async () => {
        try {
            const response = await fetch(`${API_URL}/students`); 
            if (!response.ok) {
                throw new Error('Error al obtener estudiantes');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setTotalStudents(data.length); 
            }
        } catch (error) {
            console.error("Error al obtener el total de estudiantes:", error);
        }
    };

    const fetchTotalUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/total_users`); 
            const result = await response.json();
            
            if (result.totalUsers !== undefined) {
                setTotalUsers(result.totalUsers);
            }
        } catch (error) {
            console.error("Error al obtener el total de usuarios:", error);
        }
    };

    const fetchStudentRegistrations = async () => {
        try {
            const response = await fetch(`${API_URL}/student_registrations`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const labels = data.map(item => item.registration_date);
                const counts = data.map(item => parseInt(item.total_students, 10));

                setStudentRegistrationsData({
                    labels: labels, 
                    datasets: [{
                        label: 'Nuevos Estudiantes Registrados',
                        backgroundColor: 'rgba(13, 202, 240, 0.5)', 
                        borderColor: 'var(--cui-cyan)',
                        data: counts, 
                        barPercentage: 0.7 
                    }],
                });
            }

        } catch (error) {
            console.error("Error al obtener registros de estudiantes:", error);
        }
    };

    useEffect(() => {
        fetchTotalStudents(); 
        fetchTotalUsers(); 
        fetchStudentRegistrations(); 
    }, []); 

    return (
        <CContainer fluid className="mt-3">

            <CRow>

                <CCol sm={6} lg={3} className="mb-4">
                    <CWidgetStatsA 
                        title="Total Estudiantes"
                        value={totalStudents} 
                        color="info" 
                    />
                </CCol>

                <CCol sm={6} lg={3} className="mb-4">
                    <CWidgetStatsA 
                        title="Total Usuarios del Sistema"
                        value={totalUsers} 
                        color="warning" 
                    />
                </CCol>

                <CCol sm={6} lg={3} className="mb-4">
                    <CWidgetStatsA 
                        title="Evaluaciones Pendientes"
                        value={120} 
                        color="danger" 
                    />
                </CCol>
                
                <CCol sm={6} lg={3} className="mb-4">
                    <CWidgetStatsA 
                        title="Asistencia Promedio (%)"
                        value={95.4} 
                        color="success" 
                    />
                </CCol>
                
            </CRow>

            <CRow>
                <CCol xs={12} lg={8} className="mb-4">
                    <CCard className="h-100 p-3 shadow-sm">
                        <CCardHeader>Registros de Estudiantes por Día</CCardHeader>
                        <CCardBody>
                            <CChart 
                                type="bar" 
                                data={studentRegistrationsData} 
                                style={{ height: '350px' }} 
                            /> 
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol xs={12} lg={4} className="mb-4">
                    <CCard className="h-100 shadow-sm">
                        <CCarousel controls indicators dark interval={5000}>
                            <CCarouselItem>
                                <CImage className="d-block w-100" src={imagen1} alt="Slide 1" />
                                <CCarouselCaption className="d-none d-md-block">
                                    <h5>Gestión Centralizada</h5>
                                    <p>Accede a todas las herramientas fácilmente.</p>
                                </CCarouselCaption>
                            </CCarouselItem>
                            <CCarouselItem>
                                <CImage className="d-block w-100" src={imagen2} alt="Slide 2" />
                                <CCarouselCaption className="d-none d-md-block">
                                    <h5>Análisis en Tiempo Real</h5>
                                    <p>Monitorea la actividad estudiantil.</p>
                                </CCarouselCaption>
                            </CCarouselItem>
                            <CCarouselItem>
                                <CImage className="d-block w-100" src={imagen3} alt="Slide 3" />
                                <CCarouselCaption className="d-none d-md-block">
                                    <h5>Diseño Minimalista</h5>
                                    <p>Interfaz limpia y enfocada en la productividad.</p>
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