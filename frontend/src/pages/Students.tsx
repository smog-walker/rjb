import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { studentApi, Student } from '../services/api';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../auth/AuthProvider';

export default function Students() {
  const { notify } = useToast();
  const { user } = useAuth();
  const canWriteStudents = user?.role === 'admin' || user?.role === 'teacher';
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    major: '',
    grade: '',
    math_level: '',
    programming_level: '',
    english_level: '',
    total_study_time: '',
    completed_courses: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const getErrorMessage = (error: any) => error?.response?.data?.error || error?.message || '请求失败';

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAll();
      setStudents(response.data);
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.student_id || !formData.name) {
      notify('请填写学号和姓名', 'warning');
      return;
    }
    try {
      await studentApi.create({
        student_id: formData.student_id,
        name: formData.name,
        major: formData.major,
        grade: Number(formData.grade) || 0,
        math_level: Number(formData.math_level) || 0,
        programming_level: Number(formData.programming_level) || 0,
        english_level: Number(formData.english_level) || 0,
        total_study_time: Number(formData.total_study_time) || 0,
        completed_courses: Number(formData.completed_courses) || 0,
      });
      fetchStudents();
      setFormData({
        student_id: '',
        name: '',
        major: '',
        grade: '',
        math_level: '',
        programming_level: '',
        english_level: '',
        total_study_time: '',
        completed_courses: '',
      });
      notify('学生已添加', 'success');
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      major: student.major,
      grade: String(student.grade),
      math_level: String(student.math_level),
      programming_level: String(student.programming_level),
      english_level: String(student.english_level),
      total_study_time: String(student.total_study_time),
      completed_courses: String(student.completed_courses),
    });
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    if (!formData.student_id || !formData.name) {
      notify('请填写学号和姓名', 'warning');
      return;
    }
    try {
      await studentApi.update(editingStudent.id, {
        student_id: formData.student_id,
        name: formData.name,
        major: formData.major,
        grade: Number(formData.grade) || 0,
        math_level: Number(formData.math_level) || 0,
        programming_level: Number(formData.programming_level) || 0,
        english_level: Number(formData.english_level) || 0,
        total_study_time: Number(formData.total_study_time) || 0,
        completed_courses: Number(formData.completed_courses) || 0,
      });
      fetchStudents();
      setEditingStudent(null);
      setFormData({
        student_id: '',
        name: '',
        major: '',
        grade: '',
        math_level: '',
        programming_level: '',
        english_level: '',
        total_study_time: '',
        completed_courses: '',
      });
      notify('学生信息已更新', 'success');
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除该学生吗？')) {
      try {
        await studentApi.delete(id);
        fetchStudents();
        notify('学生已删除', 'success');
      } catch (error) {
        notify(getErrorMessage(error), 'error');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>{canWriteStudents ? '学生管理' : '学生列表'}</Typography>
      
      <Grid container spacing={3}>
        {canWriteStudents && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>{editingStudent ? '编辑学生' : '添加学生'}</Typography>
                
                <TextField
                  label="学号"
                  fullWidth
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="姓名"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="专业"
                  fullWidth
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="年级"
                  type="number"
                  fullWidth
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="数学水平(0-10)"
                  type="number"
                  fullWidth
                  value={formData.math_level}
                  onChange={(e) => setFormData({ ...formData, math_level: e.target.value })}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="编程水平(0-10)"
                  type="number"
                  fullWidth
                  value={formData.programming_level}
                  onChange={(e) => setFormData({ ...formData, programming_level: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="英语水平(0-10)"
                  type="number"
                  fullWidth
                  value={formData.english_level}
                  onChange={(e) => setFormData({ ...formData, english_level: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="总学习时长(分钟)"
                  type="number"
                  fullWidth
                  value={formData.total_study_time}
                  onChange={(e) => setFormData({ ...formData, total_study_time: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="已完成课程数"
                  type="number"
                  fullWidth
                  value={formData.completed_courses}
                  onChange={(e) => setFormData({ ...formData, completed_courses: e.target.value })}
                  sx={{ mb: 3 }}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={editingStudent ? handleUpdate : handleAdd}
                  fullWidth
                  startIcon={<Add />}
                >
                  {editingStudent ? '保存修改' : '添加学生'}
                </Button>
                
                {editingStudent && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingStudent(null);
                      setFormData({
                        student_id: '',
                        name: '',
                        major: '',
                        grade: '',
                        math_level: '',
                        programming_level: '',
                        english_level: '',
                        total_study_time: '',
                        completed_courses: '',
                      });
                    }}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    取消
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: canWriteStudents ? 8 : 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">学生列表</Typography>
                <Button
                  variant="outlined"
                  onClick={fetchStudents}
                  startIcon={<Refresh />}
                >
                  刷新
                </Button>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : students.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 8 }}>暂无学生数据</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>学号</TableCell>
                        <TableCell>姓名</TableCell>
                        <TableCell>专业</TableCell>
                        <TableCell>年级</TableCell>
                        <TableCell>数学</TableCell>
                        <TableCell>编程</TableCell>
                        <TableCell>英语</TableCell>
                        <TableCell>学习时长</TableCell>
                        <TableCell>课程数</TableCell>
                        {canWriteStudents && <TableCell align="right">操作</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.major}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>{student.math_level}</TableCell>
                          <TableCell>{student.programming_level}</TableCell>
                          <TableCell>{student.english_level}</TableCell>
                          <TableCell>{student.total_study_time}</TableCell>
                          <TableCell>{student.completed_courses}</TableCell>
                          {canWriteStudents && (
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button size="small" onClick={() => handleEdit(student)} startIcon={<Edit />}>
                                  编辑
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDelete(student.id)} startIcon={<Delete />}>
                                  删除
                                </Button>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
