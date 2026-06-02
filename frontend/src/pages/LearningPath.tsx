import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AccessTime, AltRoute, CalendarMonth, CheckCircle } from '@mui/icons-material';
import { courseApi, learningPathApi, studentApi, Student } from '../services/api';
import { useToast } from '../components/ToastProvider';

const DEFAULT_TARGET_DAYS = 7;

const COURSE_TOPIC_MAP: Record<string, string[]> = {
  人工智能导论: ['人工智能概述', '机器学习基础', '监督学习', '无监督学习', '模型评估', '深度学习概览', '神经网络基础'],
  机器学习实战: ['数据预处理', '特征工程', '线性回归', '逻辑回归', '决策树', '集成学习', '模型调参'],
  深度学习入门: ['感知机与多层网络', '反向传播', '优化器与正则化', '卷积神经网络', '循环神经网络', '注意力机制', '训练技巧'],
};

export default function LearningPath() {
  const { notify } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [targetDays, setTargetDays] = useState<number>(DEFAULT_TARGET_DAYS);
  const [generationMeta, setGenerationMeta] = useState<{ course_name: string; topics: string[]; target_days: number } | null>(
    null
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentApi.getAll();
        setStudents(response.data);
      } catch (error) {
        notify((error as any)?.response?.data?.error || (error as any)?.message || '获取学生列表失败', 'error');
      }
    };
    fetchStudents();
  }, []);

  const handleGenerate = async () => {
    if (selectedStudent === null) return;

    setLoading(true);
    try {
      const courseResp = await courseApi.recommend(selectedStudent);
      const recommendedCourseName =
        (courseResp.data as any)?.recommendations?.[0]?.name || Object.keys(COURSE_TOPIC_MAP)[0] || '人工智能导论';
      const generatedTopics = COURSE_TOPIC_MAP[recommendedCourseName] || COURSE_TOPIC_MAP['人工智能导论'] || [];

      const response = await learningPathApi.generate({
        student_id: selectedStudent,
        course_name: recommendedCourseName,
        topics: generatedTopics,
        target_days: targetDays,
      });
      setPath(response.data);
      setGenerationMeta({ course_name: recommendedCourseName, topics: generatedTopics, target_days: targetDays });
      if ((response.data as any)?.generated_by === 'fallback') {
        notify(`AI 未生效（${(response.data as any)?.ai_error || 'unknown'}），已使用本地模板生成`, 'warning');
      }
      notify('学习路径已生成', 'success');
    } catch (error) {
      notify((error as any)?.response?.data?.error || (error as any)?.message || '生成学习路径失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id: number) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : '未知';
  };

  const getDayName = (day: number) => {
    const days = ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天', '第七天'];
    return days[day - 1] || `第${day}天`;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>学习路径规划</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>一键生成</Typography>
              
              <Typography variant="subtitle1" sx={{ mb: 2 }}>选择学生</Typography>
              <select
                value={selectedStudent || ''}
                onChange={(e) => {
                  const nextId = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedStudent(nextId);
                  setPath(null);
                  setGenerationMeta(null);
                }}
                className="w-full p-2 border rounded mb-3"
              >
                <option value="">请选择学生</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>

              <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(102, 126, 234, 0.06)' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  系统将基于课程推荐自动生成学习路径，支持自定义计划天数。
                </Typography>
                <TextField
                  label="计划天数"
                  type="number"
                  size="small"
                  value={targetDays}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isFinite(v)) return;
                    const next = Math.max(1, Math.min(60, Math.floor(v)));
                    setTargetDays(next);
                  }}
                  slotProps={{ htmlInput: { min: 1, max: 60 } }}
                  sx={{ mt: 1.5 }}
                  fullWidth
                />
              </Paper>

              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={loading || selectedStudent === null}
                fullWidth
              >
                一键生成学习路径
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>学习路径</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : path ? (
                <Box>
                  <Paper sx={{ p: 4, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CalendarMonth sx={{ fontSize: 32, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {getStudentName(path.student_id)}的{path.course_name}学习计划
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                          共{path.planned_days}天，涵盖{path.total_topics}个知识点
                        </Typography>
                        {generationMeta && (
                          <Typography variant="body2" sx={{ color: 'textSecondary', mt: 0.5 }}>
                            生成方式：课程推荐（{generationMeta.course_name}），计划 {generationMeta.target_days} 天
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>

                  {path.daily_plan.map((dayPlan: any) => (
                    <Card key={dayPlan.day} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <AccessTime sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="h6">{getDayName(dayPlan.day)}</Typography>
                            <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                              日期：{dayPlan.date}，预计 {dayPlan.total_hours} 小时
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>学习内容</Typography>
                        <Box>
                          {dayPlan.topics.map((t: any, i: number) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                  {t.topic}（{t.duration} 分钟）
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                                  学习方式：{t.learning_style}
                                </Typography>
                                {Array.isArray(t.resources) && t.resources.length > 0 && (
                                  <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                                    推荐资源：{t.resources.join('、')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  <Paper sx={{ p: 3, mt: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>学习建议</Typography>
                    <Typography>{path.optimized_recommendations}</Typography>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
                  <AltRoute sx={{ fontSize: 64, color: '#ccc', mb: 4 }} />
                  <Typography variant="h6">学习路径规划</Typography>
                  <Typography variant="body2" sx={{ color: 'textSecondary' }}>配置参数并生成个性化学习路径</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
