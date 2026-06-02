import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AccessTime, EmojiEvents, TrackChanges, TrendingUp } from '@mui/icons-material';
import { evaluationApi, studentApi, Student, EvaluationResult } from '../services/api';
import { useToast } from '../components/ToastProvider';

export default function Evaluation() {
  const { notify } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
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

  const handleAssess = async () => {
    if (selectedStudent === null) {
      notify('请选择学生', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await evaluationApi.assess(selectedStudent);
      setEvaluation(response.data);
      if ((response.data as any)?.generated_by === 'fallback') {
        notify(`AI 未生效（${(response.data as any)?.ai_error || 'unknown'}），已使用本地模板生成`, 'warning');
      }
      notify('评估已完成', 'success');
    } catch (error) {
      notify((error as any)?.response?.data?.error || (error as any)?.message || '评估失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLevelPalette = (level: string) => {
    switch (level) {
      case '优秀':
        return { bg: '#DCFCE7', fg: '#166534', border: '#86EFAC' };
      case '良好':
        return { bg: '#DBEAFE', fg: '#1D4ED8', border: '#93C5FD' };
      case '及格':
        return { bg: '#FEF3C7', fg: '#92400E', border: '#FCD34D' };
      default:
        return { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' };
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>学习效果评估</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>选择学生</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {students.map((student) => (
                  <Button
                    key={student.id}
                    variant={selectedStudent === student.id ? 'contained' : 'outlined'}
                    onClick={() => setSelectedStudent(student.id)}
                    fullWidth
                  >
                    {student.name}
                  </Button>
                ))}
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssess}
                disabled={loading || selectedStudent === null}
                fullWidth
                sx={{ mt: 4 }}
              >
                开始评估
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {loading ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
                  <CircularProgress />
                </Box>
              </CardContent>
            </Card>
          ) : evaluation ? (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5">{evaluation.student_name}</Typography>
                      <Typography color="textSecondary">{evaluation.evaluation_period}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                        {evaluation.overall_score}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: getLevelPalette(evaluation.overall_level).bg,
                          border: `1px solid ${getLevelPalette(evaluation.overall_level).border}`,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, color: getLevelPalette(evaluation.overall_level).fg }}>
                          {evaluation.overall_level}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { title: '总体等级', value: evaluation.overall_level, level: evaluation.overall_level },
                  { title: '学习投入', value: evaluation.dimensions.investment.level, level: evaluation.dimensions.investment.level },
                  { title: '知识掌握', value: evaluation.dimensions.mastery.level, level: evaluation.dimensions.mastery.level },
                  { title: '学习效率', value: evaluation.dimensions.efficiency.level, level: evaluation.dimensions.efficiency.level },
                ].map((item) => {
                  const palette = getLevelPalette(item.level);
                  return (
                    <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          bgcolor: palette.bg,
                          border: `1px solid ${palette.border}`,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography sx={{ color: palette.fg, fontWeight: 700, fontSize: 14 }}>{item.title}</Typography>
                        <Typography sx={{ color: palette.fg, fontWeight: 900, fontSize: 22, mt: 1 }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <AccessTime sx={{ color: '#667eea' }} />
                        <Typography variant="h6">学习投入</Typography>
                      </Box>
                      <Typography variant="h4">{evaluation.dimensions.investment.level}</Typography>
                      <Typography color="textSecondary">
                        日均学习 {evaluation.dimensions.investment.daily_average_minutes} 分钟
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <TrackChanges sx={{ color: '#4facfe' }} />
                        <Typography variant="h6">知识掌握</Typography>
                      </Box>
                      <Typography variant="h4">{evaluation.dimensions.mastery.level}</Typography>
                      <Typography color="textSecondary">
                        掌握 {evaluation.dimensions.mastery.excellent_topics.length} 个知识点
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <TrendingUp sx={{ color: '#43e97b' }} />
                        <Typography variant="h6">学习效率</Typography>
                      </Box>
                      <Typography variant="h4">{evaluation.dimensions.efficiency.level}</Typography>
                      <Typography color="textSecondary">
                        效率评分 {evaluation.dimensions.efficiency.efficiency_score}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmojiEvents sx={{ color: '#f093fb' }} />
                    <Typography variant="h6">AI评语</Typography>
                  </Box>
                  <Typography>{evaluation.ai_commentary}</Typography>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>改进建议</Typography>
                  <ul>
                    {evaluation.improvement_suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
                  <TrendingUp sx={{ fontSize: 64, color: '#ccc', mb: 4 }} />
                  <Typography variant="h6">学习效果评估</Typography>
                  <Typography variant="body2" color="textSecondary">选择学生并点击评估按钮</Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
