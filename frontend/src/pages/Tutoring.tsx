import React, { useState, useEffect } from 'react';
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
import { Chat, HelpOutlined } from '@mui/icons-material';
import { tutoringApi, studentApi, Student } from '../services/api';
import { useToast } from '../components/ToastProvider';

export default function Tutoring() {
  const { notify } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState<any>(null);
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

  const handleAsk = async () => {
    if (selectedStudent === null || !question) {
      notify('请选择学生并输入问题', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await tutoringApi.ask({
        student_id: selectedStudent,
        question,
        topic: topic || undefined,
      });
      setAnswer(response.data);
      if ((response.data as any)?.generated_by === 'fallback') {
        notify(`AI 未生效（${(response.data as any)?.ai_error || 'unknown'}），已使用本地模板生成`, 'warning');
      }
      notify('已生成解答', 'success');
    } catch (error) {
      notify((error as any)?.response?.data?.error || (error as any)?.message || '获取解答失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>智能辅导</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>提问</Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>选择学生</Typography>
              <select
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
                className="w-full p-2 border rounded mb-3"
              >
                <option value="">请选择学生</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>

              <TextField
                label="相关知识点（可选）"
                fullWidth
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                label="问题"
                multiline
                rows={4}
                fullWidth
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="请输入您的问题..."
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleAsk}
                disabled={loading}
                fullWidth
                startIcon={<Chat />}
              >
                提问
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>解答</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : answer ? (
                <Box>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>问题</Typography>
                    <Typography>{answer.question}</Typography>
                  </Paper>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>文字解答</Typography>
                    <Typography>{answer.text_answer}</Typography>
                  </Paper>

                  {answer.video_script && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>视频脚本</Typography>
                      {answer.video_script.map((scene: any, i: number) => (
                        <Box key={i} sx={{ mb: 2 }}>
                          <Typography sx={{ fontWeight: 'bold' }}>场景{i + 1} ({scene.duration})</Typography>
                          <Typography>{scene.content}</Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}

                  {answer.code_demo && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>代码演示</Typography>
                      <pre>{answer.code_demo.code}</pre>
                      <Typography>{answer.code_demo.explanation}</Typography>
                    </Paper>
                  )}

                  {answer.learning_tips && answer.learning_tips.length > 0 && (
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>学习技巧</Typography>
                      <ul>
                        {answer.learning_tips.map((tip: string, i: number) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
                  <HelpOutlined sx={{ fontSize: 64, color: '#ccc', mb: 4 }} />
                  <Typography variant="h6">智能辅导</Typography>
                  <Typography variant="body2" color="textSecondary">输入问题获取个性化解答</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
