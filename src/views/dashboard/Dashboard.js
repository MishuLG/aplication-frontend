import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CWidgetStatsA,
  CCarousel,
  CCarouselItem,
  CImage,
} from "@coreui/react";
import Chart from "react-apexcharts";
import imagen1 from '../../../public/img/WhatsApp Image 2024-11-16 at 2.22.38 PM.jpeg';
import imagen2 from '../../../public/img/73dd40dc057fbb426a0f758bcd442c96.jpg';

const images = [imagen1, imagen2];

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [studentRegistrationData, setStudentRegistrationData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersRes = await fetch("http://localhost:4000/api/users");
      const studentsRes = await fetch("http://localhost:4000/api/students");

      const usersData = await usersRes.json();
      const studentsData = await studentsRes.json();

      setTotalUsers(usersData.length);

      const studentCountsByDate = studentsData.reduce((acc, student) => {
        const date = student.created_at.split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.keys(studentCountsByDate).map((date) => ({
        x: date,
        y: studentCountsByDate[date],
      }));

      setStudentRegistrationData(formattedData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const studentChartOptions = {
    chart: { id: "student-registrations", type: "line" },
    xaxis: { type: "datetime" },
  };

  return (
    <div>
      <CCarousel controls indicators>
        {images.map((image, index) => (
          <CCarouselItem key={index}>
            <CImage className="d-block w-100" src={image} alt={`Slide ${index + 1}`} />
          </CCarouselItem>
        ))}
      </CCarousel>

      <h1 className="text-center mt-4">Welcome!</h1>

      <CRow className="mt-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsA className="mb-4" color="primary" value={totalUsers} title="Total Users" />
        </CCol>
      </CRow>

      <CCard>
        <CCardHeader>Student Registrations Per Day</CCardHeader>
        <CCardBody>
          <Chart options={studentChartOptions} series={[{ name: "Students", data: studentRegistrationData }]} type="line" height={300} />
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Dashboard;
