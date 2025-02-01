import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react';

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [formData, setFormData] = useState({
    id_student: '',
    id_subject: '',
    id_class_schedules: '',
    total_rating: '',
    date_evaluation: '',
    score: '',
    max_score: '',
    remarks: '',
    evaluation_type: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [filter, setFilter] = useState({ id_student: '', id_subject: '' });

  const API_URL = 'http://localhost:4000/api/evaluations';

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEvaluations(data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const handleSaveEvaluation = async () => {
    try {
      const url = editMode ? `${API_URL}/${selectedEvaluation.id_evaluations}` : API_URL;
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchEvaluations();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving evaluation:', error);
    }
  };

  const handleEditEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setFormData({
      id_student: evaluation.id_student,
      id_subject: evaluation.id_subject,
      id_class_schedules: evaluation.id_class_schedules,
      total_rating: evaluation.total_rating,
      date_evaluation: evaluation.date_evaluation,
      score: evaluation.score,
      max_score: evaluation.max_score,
      remarks: evaluation.remarks,
      evaluation_type: evaluation.evaluation_type,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteEvaluation = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchEvaluations();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id_student: '',
      id_subject: '',
      id_class_schedules: '',
      total_rating: '',
      date_evaluation: '',
      score: '',
      max_score: '',
      remarks: '',
      evaluation_type: '',
    });
    setEditMode(false);
    setSelectedEvaluation(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.id_student.toString().includes(filter.id_student) &&
      evaluation.id_subject.toString().includes(filter.id_subject)
  );

  return (
    <CCard>
      <CCardHeader>
        <h5>Evaluations</h5>
        <CButton color="success" onClick={() => setShowModal(true)}>
          Add Evaluation
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <CFormInput
            placeholder="Filter by student ID"
            name="id_student"
            value={filter.id_student}
            onChange={handleFilterChange}
            className="mb-2"
          />
          <CFormInput
            placeholder="Filter by subject ID"
            name="id_subject"
            value={filter.id_subject}
            onChange={handleFilterChange}
          />
        </div>
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID Evaluation</CTableHeaderCell>
              <CTableHeaderCell>Student ID</CTableHeaderCell>
              <CTableHeaderCell>Subject ID</CTableHeaderCell>
              <CTableHeaderCell>Class Schedule ID</CTableHeaderCell>
              <CTableHeaderCell>Total Rating</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Score</CTableHeaderCell>
              <CTableHeaderCell>Max Score</CTableHeaderCell>
              <CTableHeaderCell>Remarks</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Created At</CTableHeaderCell>
              <CTableHeaderCell>Updated At</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredEvaluations.map((evaluation) => (
              <CTableRow key={evaluation.id_evaluations}>
                <CTableDataCell>{evaluation.id_evaluations}</CTableDataCell>
                <CTableDataCell>{evaluation.id_student}</CTableDataCell>
                <CTableDataCell>{evaluation.id_subject}</CTableDataCell>
                <CTableDataCell>{evaluation.id_class_schedules}</CTableDataCell>
                <CTableDataCell>{evaluation.total_rating}</CTableDataCell>
                <CTableDataCell>{evaluation.date_evaluation}</CTableDataCell>
                <CTableDataCell>{evaluation.score}</CTableDataCell>
                <CTableDataCell>{evaluation.max_score}</CTableDataCell>
                <CTableDataCell>{evaluation.remarks}</CTableDataCell>
                <CTableDataCell>{evaluation.evaluation_type}</CTableDataCell>
                <CTableDataCell>{evaluation.created_at}</CTableDataCell>
                <CTableDataCell>{evaluation.updated_at}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleEditEvaluation(evaluation)}
                  >
                    Edit
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteEvaluation(evaluation.id_evaluations)}
                  >
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CModal visible={showModal} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>{editMode ? 'Edit Evaluation' : 'Add Evaluation'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                label="Student ID"
                value={formData.id_student}
                onChange={(e) => setFormData({ ...formData, id_student: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Subject ID"
                value={formData.id_subject}
                onChange={(e) => setFormData({ ...formData, id_subject: e.target.value })}
                required
              />
              <CFormInput
                type="text"
                label="Class Schedule ID"
                value={formData.id_class_schedules}
                onChange={(e) => setFormData({ ...formData, id_class_schedules: e.target.value })}
                required
              />
              <CFormInput
                type="number"
                label="Total Rating"
                value={formData.total_rating}
                onChange={(e) => setFormData({ ...formData, total_rating: e.target.value })}
              />
              <CFormInput
                type="date"
                label="Date of Evaluation"
                value={formData.date_evaluation}
                onChange={(e) => setFormData({ ...formData, date_evaluation: e.target.value })}
                required
              />
              <CFormInput
                type="number"
                label="Score"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
              />
              <CFormInput
                type="number"
                label="Max Score"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                required
              />
              <CFormTextarea
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows="3"
              />
              <CFormSelect
                label="Evaluation Type"
                value={formData.evaluation_type}
                onChange={(e) => setFormData({ ...formData, evaluation_type: e.target.value })}
                required
              >
                <option value="">Select Evaluation Type</option>
                <option value="summative">Exam</option>
                <option value="formative">Quiz</option>
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleSaveEvaluation}>
              Save
            </CButton>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancel
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Evaluations;