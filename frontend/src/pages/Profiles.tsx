import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Person } from '@mui/icons-material';
import { profileApi, studentApi, Student } from '../services/api';
import { useToast } from '../components/ToastProvider';
import RadarChart from '../components/RadarChart';
import LineChart from '../components/LineChart';

export default function Profiles() {
  const { notify } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll();
      setStudents(response.data);
    } catch (error) {
      notify((error as any)?.response?.data?.error || (error as any)?.message || '获取学生列表失败', 'error');
    }
  };

  const handleView = async (studentId: number) => {
    setSelectedStudent(studentId);
    setLoading(true);
    try {
      const response = await profileApi.getById(studentId);
      setProfile(response.data);
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        try {
          const response = await profileApi.generate(studentId);
          setProfile(response.data);
          if ((response.data as any)?.generated_by === 'fallback') {
            notify(`AI 未生效（${(response.data as any)?.ai_error || 'unknown'}），已使用本地模板生成`, 'warning');
          }
          notify('画像已生成', 'success');
          return;
        } catch (e) {
          notify((e as any)?.response?.data?.error || (e as any)?.message || '生成画像失败', 'error');
        }
      } else {
        notify((error as any)?.response?.data?.error || (error as any)?.message || '获取画像失败', 'error');
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id: number) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : '未知';
  };

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>学习画像</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>选择学生</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                点击学生即可查看画像；若画像不存在会自动生成。
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {students.map((student) => (
                  <Button
                    key={student.id}
                    variant={selectedStudent === student.id ? 'contained' : 'outlined'}
                    onClick={() => handleView(student.id)}
                    sx={{ justifyContent: 'flex-start' }}
                    fullWidth
                  >
                    <Person sx={{ mr: 2 }} />
                    {student.name}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>学生学习画像</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : profile ? (
                <Box>
                  <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {selectedStudent === null ? '未选择' : getStudentName(selectedStudent)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                      学生ID: {profile.student_id}
                    </Typography>
                  </Paper>

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12 }}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <RadarChart
                          title="基础能力维度（雷达图）"
                          items={[
                            { label: '逻辑', value: toNum(profile.logical_thinking) },
                            { label: '解题', value: toNum(profile.problem_solving) },
                            { label: '速度', value: toNum(profile.learning_speed) },
                            { label: '注意', value: toNum(profile.attention) },
                            { label: '创造', value: toNum(profile.creativity) },
                          ]}
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <LineChart
                          title="知识基础（折线图）"
                          width={720}
                          points={[
                            { label: '数学', value: toNum(profile.math_level) },
                            { label: '编程', value: toNum(profile.programming_level) },
                            { label: '英语', value: toNum(profile.english_level) },
                          ]}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" sx={{ mb: 3 }}>学习风格与偏好</Typography>
                  <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" sx={{ color: 'textSecondary' }}>学习风格</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{profile.learning_style || '综合型'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" sx={{ color: 'textSecondary' }}>认知风格</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{profile.cognitive_style || '分析型'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" sx={{ color: 'textSecondary' }}>最佳学习时间</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{profile.best_time || '上午'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" sx={{ color: 'textSecondary' }}>学习动机</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{profile.learning_motivation || '中等'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {profile.strengths && (
                    <Paper sx={{ p: 3, mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>优势</Typography>
                      <Typography>{profile.strengths}</Typography>
                    </Paper>
                  )}

                  {profile.weaknesses && (
                    <Paper sx={{ p: 3, mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>弱点</Typography>
                      <Typography>{profile.weaknesses}</Typography>
                    </Paper>
                  )}

                  {profile.suggestions && (
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>个性化建议</Typography>
                      <Typography>{profile.suggestions}</Typography>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
                  <Person sx={{ fontSize: 64, color: '#ccc', mb: 4 }} />
                  <Typography variant="h6">学习画像</Typography>
                  <Typography variant="body2" sx={{ color: 'textSecondary' }}>选择学生并生成个性化学习画像</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
