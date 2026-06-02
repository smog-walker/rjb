import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Divider, FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import { authApi } from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/ToastProvider';

type NotificationSettings = {
  enableToasts: boolean;
};

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem('notification_settings');
    if (!raw) return { enableToasts: true };
    const parsed = JSON.parse(raw);
    return {
      enableToasts: parsed.enableToasts !== false,
    };
  } catch {
    return { enableToasts: true };
  }
}

function saveSettings(s: NotificationSettings) {
  localStorage.setItem('notification_settings', JSON.stringify(s));
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => loadSettings());

  const canShowStudentId = useMemo(() => user?.role === 'student', [user?.role]);

  const onSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      notify('请输入当前密码与新密码', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      notify('两次输入的新密码不一致', 'warning');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      notify('密码已更新，请重新登录', 'success');
      logout();
    } catch (err: any) {
      notify(err?.response?.data?.error || err?.message || '修改密码失败', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleToasts = (checked: boolean) => {
    const next = { ...notificationSettings, enableToasts: checked };
    setNotificationSettings(next);
    saveSettings(next);
    notify('设置已保存', 'success');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        设置
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            个人账户
          </Typography>
          <Typography sx={{ mb: 0.5 }}>用户名：{user?.username}</Typography>
          <Typography sx={{ mb: 0.5 }}>角色：{user?.role}</Typography>
          {canShowStudentId && <Typography sx={{ mb: 0.5 }}>关联学生ID：{String(user?.student_id ?? '')}</Typography>}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            修改密码
          </Typography>
          <TextField
            fullWidth
            label="当前密码"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="新密码"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="确认新密码"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={onSavePassword} disabled={savingPassword}>
            {savingPassword ? '保存中…' : '保存'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            消息与通知
          </Typography>
          <FormControlLabel
            control={<Switch checked={notificationSettings.enableToasts} onChange={(e) => toggleToasts(e.target.checked)} />}
            label="开启页面提示（Toast）"
          />
          <Divider sx={{ my: 2 }} />
          <Button variant="outlined" color="error" onClick={logout}>
            退出登录
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

