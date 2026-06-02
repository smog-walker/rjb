import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Badge,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Home,
  People,
  BarChart,
  Description,
  AltRoute,
  HelpOutlined,
  TrendingUp,
  Menu as MenuIcon,
  Close,
  Notifications,
  Settings,
  Person,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from './ToastProvider';

const drawerWidth = 280;

const menuItems = [
  { path: '/', label: '首页仪表盘', icon: Home, badge: 0 },
  { path: '/students', label: '学生管理', icon: People, badge: 0 },
  { path: '/profiles', label: '学习画像', icon: BarChart, badge: 0 },
  { path: '/resource-generator', label: '资源生成', icon: Description, badge: 0 },
  { path: '/learning-path', label: '学习路径', icon: AltRoute, badge: 0 },
  { path: '/tutoring', label: '智能辅导', icon: HelpOutlined, badge: 0 },
  { path: '/evaluation', label: '效果评估', icon: TrendingUp, badge: 0 },
  { path: '/settings', label: '设置', icon: Settings, badge: 0 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    notify('已退出登录', 'info');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #fff 0%, #e0e0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          智能学习助手
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  mx: 1.5,
                  borderRadius: 2,
                  mb: 0.5,
                  color: isActive ? 'primary.main' : 'text.primary',
                  bgcolor: isActive ? 'rgba(102, 126, 234, 0.12)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.08)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: isActive ? '0.95rem' : '0.9rem',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
                {item.badge > 0 && (
                  <Badge badgeContent={item.badge} color="error" />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>
      <Divider />
      <List />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleProfileMenuOpen}>
            <Person />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              {user?.username}（{user?.role}）
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate('/settings');
              }}
            >
              账户设置
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>退出登录</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f7fa',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
