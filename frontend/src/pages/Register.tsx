import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi, studentApi, Student } from '../services/api';
import { useToast } from '../components/ToastProvider';

type Role = 'admin' | 'teacher' | 'student';

export default function Register() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<number | ''>('');

  const canSelectStudent = role === 'student';

  useEffect(() => {
    let mounted = true;
    if (!canSelectStudent) {
      setStudentId('');
      return;
    }
    studentApi
      .getAll()
      .then((resp) => {
        if (!mounted) return;
        setStudents(resp.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setStudents([]);
      });
    return () => {
      mounted = false;
    };
  }, [canSelectStudent]);

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        id: s.id,
        label: `${s.name}（${s.student_id}）`,
      })),
    [students]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      notify('请输入用户名与密码', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      notify('两次输入的密码不一致', 'warning');
      return;
    }
    if (role === 'student' && studentId === '') {
      notify('请选择关联的学生', 'warning');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        username,
        password,
        role,
        student_id: role === 'student' ? Number(studentId) : undefined,
      });
      notify('注册成功，请登录', 'success');
      navigate('/login', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.message || '注册失败';
      if (status === 401) {
        notify('当前系统已存在用户，注册需要管理员登录后操作', 'warning');
        return;
      }
      if (status === 403) {
        notify('无权限创建用户（需要管理员）', 'warning');
        return;
      }
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#f5f7fa' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            注册
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>首次启动可创建首个管理员；后续需要管理员权限</Typography>
          <Box component="form" onSubmit={onSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">角色</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="角色"
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <MenuItem value="student">学生</MenuItem>
                <MenuItem value="teacher">老师</MenuItem>
                <MenuItem value="admin">管理员</MenuItem>
              </Select>
            </FormControl>

            {canSelectStudent && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="student-label">关联学生</InputLabel>
                <Select
                  labelId="student-label"
                  value={studentId}
                  label="关联学生"
                  onChange={(e) => setStudentId(e.target.value as any)}
                >
                  {studentOptions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              margin="normal"
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              margin="normal"
            />
            <TextField
              fullWidth
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              margin="normal"
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, height: 44 }} disabled={loading}>
              {loading ? '注册中…' : '注册'}
            </Button>
            <Button
              type="button"
              fullWidth
              variant="text"
              sx={{ mt: 1, height: 40 }}
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              返回登录
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

