import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/ToastProvider';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      notify('请输入用户名与密码', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      notify('登录成功', 'success');
      navigate('/', { replace: true });
    } catch (err: any) {
      notify(err?.response?.data?.error || err?.message || '登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#f5f7fa' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            登录
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>使用账号访问系统功能</Typography>
          <Box component="form" onSubmit={onSubmit}>
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
              autoComplete="current-password"
              margin="normal"
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, height: 44 }} disabled={loading}>
              {loading ? '登录中…' : '登录'}
            </Button>
            <Button
              type="button"
              fullWidth
              variant="text"
              sx={{ mt: 1, height: 40 }}
              onClick={() => navigate('/register')}
              disabled={loading}
            >
              注册新账号
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
