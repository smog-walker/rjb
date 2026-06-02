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
import { Code, Dataset, Description, Image, List, MenuBook, PlayCircle } from '@mui/icons-material';
import { resourceApi, studentApi, Student } from '../services/api';
import { useToast } from '../components/ToastProvider';

const resourceTypes = [
  { id: 'course_document', label: '课程文档', icon: Description },
  { id: 'mind_map', label: '思维导图', icon: List },
  { id: 'quiz_bank', label: '题库', icon: Dataset },
  { id: 'ppt_content', label: 'PPT内容', icon: Image },
  { id: 'video_script', label: '视频脚本', icon: PlayCircle },
  { id: 'code_case', label: '代码案例', icon: Code },
  { id: 'reading_material', label: '阅读材料', icon: MenuBook },
];

export default function ResourceGenerator() {
  const { notify } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [courseName, setCourseName] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleGenerate = async () => {
    if (selectedStudent === null || !courseName || !topic) {
      notify('请填写完整信息', 'warning');
      return;
    }

    const resourcesToGenerate = selectedResources.length > 0 ? selectedResources : resourceTypes.map(r => r.id);

    setLoading(true);
    try {
      const normalizeResources = (data: any) => {
        if (data && data.resources) return data.resources;
        if (data && data.generated_resources) return data.generated_resources;
        const res: Record<string, any> = {};
        resourceTypes.forEach(({ id }) => {
          if (data && data[id] !== undefined) res[id] = data[id];
        });
        return res;
      };

      const response =
        selectedResources.length > 0
          ? await resourceApi.generate({
              student_id: selectedStudent,
              course_name: courseName,
              topic,
              resource_types: resourcesToGenerate,
            })
          : await resourceApi.generateAll(selectedStudent, courseName, topic);

      const data = response.data;
      setResults({ ...data, resources: normalizeResources(data) });
      const sources = (data as any)?.resource_sources;
      const errors = (data as any)?.resource_errors;
      if (sources && typeof sources === 'object') {
        const failedTypes = Object.keys(sources).filter((k) => sources[k] !== 'xunfei_spark');
        if (failedTypes.length > 0) {
          notify(`AI 未生效（${errors?.[failedTypes[0]] || 'unknown'}），已对部分资源使用本地模板`, 'warning');
        }
      }
      notify('资源已生成', 'success');
    } catch (error) {
      notify((error as any)?.response?.data?.error || (error as any)?.message || '生成资源失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id: number) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : '未知';
  };

  const renderResourceCard = (type: string, data: any) => {
    const resourceType = resourceTypes.find(r => r.id === type);
    if (!resourceType || !data) return null;

    const Icon = resourceType.icon;

    return (
      <Card key={type} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Icon sx={{ color: 'primary.main' }} />
            <Typography variant="h6">{resourceType.label}</Typography>
          </Box>
          
          {type === 'video_script' && Array.isArray(data) ? (
            <Box>
              {data.map((scene: any, i: number) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    场景{i + 1} ({scene.duration})
                  </Typography>
                  <Typography>{scene.content}</Typography>
                </Paper>
              ))}
            </Box>
          ) : type === 'mind_map' && data && typeof data === 'object' ? (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  中心主题：{data.center || results?.topic || ''}
                </Typography>
                {Array.isArray(data.branches) && data.branches.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.branches.map((b: any, i: number) => (
                      <Box key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{b.title}</Typography>
                        {Array.isArray(b.subtopics) && b.subtopics.length > 0 && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {b.subtopics.join('、')}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                    {JSON.stringify(data, null, 2)}
                  </Box>
                )}
              </Paper>
            </Box>
          ) : type === 'code_case' && data.code ? (
            <Box>
              <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                {data.code}
              </Box>
              <Typography sx={{ mt: 2 }}>{data.explanation}</Typography>
            </Box>
          ) : type === 'quiz_bank' && Array.isArray(data) ? (
            <Box>
              {data.map((quiz: any, i: number) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    题目{i + 1}. {quiz.question}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>答案: {quiz.answer}</Typography>
                  <Typography variant="body2">{quiz.explanation}</Typography>
                </Paper>
              ))}
            </Box>
          ) : type === 'ppt_content' && Array.isArray(data) ? (
            <Box>
              {data.map((slide: any, i: number) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    第{slide.slide_number || i + 1}页：{slide.title || ''}
                  </Typography>
                  {slide.main_content && <Typography sx={{ mt: 1 }}>{slide.main_content}</Typography>}
                  {Array.isArray(slide.bullet_points) && slide.bullet_points.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {slide.bullet_points.map((bp: any, idx: number) => (
                        <Typography key={idx} variant="body2" sx={{ color: 'text.secondary' }}>
                          - {bp}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          ) : type === 'reading_material' && Array.isArray(data) ? (
            <Box>
              {data.map((m: any, i: number) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{m.title || `资料${i + 1}`}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {m.type || ''}{m.author ? ` · ${m.author}` : ''}{m.url ? ` · ${m.url}` : ''}
                  </Typography>
                  {m.summary && <Typography sx={{ mt: 1 }}>{m.summary}</Typography>}
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography>
              {data && typeof data === 'object' ? JSON.stringify(data) : String(data ?? '')}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>资源生成</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>生成设置</Typography>
              
              <Typography variant="subtitle1" sx={{ mb: 2 }}>选择学生</Typography>
              <select
                value={selectedStudent || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedStudent(v ? Number(v) : null);
                }}
                className="w-full p-2 border rounded mb-3"
              >
                <option value="">请选择学生</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>

              <TextField
                label="课程名称"
                fullWidth
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                label="知识点/主题"
                fullWidth
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle1" sx={{ mb: 2 }}>难度级别</Typography>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border rounded mb-3"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>资源类型（可选，默认全部生成）</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {resourceTypes.map(resource => {
                  const Icon = resource.icon;
                  return (
                    <Button
                      key={resource.id}
                      variant={selectedResources.includes(resource.id) ? 'contained' : 'outlined'}
                      onClick={() => toggleResource(resource.id)}
                      size="small"
                      startIcon={<Icon />}
                    >
                      {resource.label}
                    </Button>
                  );
                })}
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={loading || selectedStudent === null || !courseName || !topic}
                fullWidth
                sx={{ mt: 3 }}
              >
                生成资源
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>生成结果</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : results ? (
                <Box>
                  <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>学生</Typography>
                    <Typography>{getStudentName(results.student_id)}</Typography>
                  </Paper>
                  <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>课程</Typography>
                    <Typography>{results.course_name}</Typography>
                  </Paper>
                  <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>主题</Typography>
                    <Typography>{results.topic}</Typography>
                  </Paper>

                  {Object.entries(results.resources || {}).map(([type, data]) =>
                    renderResourceCard(type, data)
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
                  <Description sx={{ fontSize: 64, color: '#ccc', mb: 4 }} />
                  <Typography variant="h6">资源生成</Typography>
                  <Typography variant="body2" sx={{ color: 'textSecondary' }}>配置参数并生成学习资源</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
