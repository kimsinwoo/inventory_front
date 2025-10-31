import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Dash from './pages/Dash';
import Basic from './pages/Basic';
import Receiving from './pages/Receiving';
import Manufacturing from './pages/Manufacturing';
import Inventory from './pages/Inventory';
import Shipping from './pages/Shipping';
import ApprovalDashboard from './pages/ApprovalDashboard';
import Label from './pages/Label';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Mypage from './pages/Mypage';

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />

      {/* 메인 애플리케이션 라우트 */}
      <Route path='/' element={<Navigate to='/dash' replace />} />
      <Route path='/' element={<Home />}>
        <Route path='dash' element={<Dash />} />
        <Route path='basic' element={<Basic />} />
        <Route
          path='receiving/nav1'
          element={<Receiving subPage='nav1' />}
        />
        <Route
          path='receiving/nav2'
          element={<Receiving subPage='nav2' />}
        />
        <Route
          path='receiving/nav3'
          element={<Receiving subPage='nav3' />}
        />
        <Route
          path='receiving/nav4'
          element={<Receiving subPage='nav4' />}
        />
        <Route
          path='manufacturing/nav1'
          element={<Manufacturing subPage='nav1' />}
        />
        <Route
          path='manufacturing/nav2'
          element={<Manufacturing subPage='nav2' />}
        />
        <Route
          path='manufacturing/nav3'
          element={<Manufacturing subPage='nav3' />}
        />
        <Route
          path='manufacturing/nav4'
          element={<Manufacturing subPage='nav4' />}
        />
        <Route
          path='manufacturing/nav5'
          element={<Manufacturing subPage='nav5' />}
        />
        <Route
          path='manufacturing/factory/:factoryId'
          element={<Manufacturing subPage='factory' />}
        />
        <Route path='inventory' element={<Inventory />} />
        <Route path='shipping/nav1' element={<Shipping subPage='nav1' />} />
        <Route path='shipping/nav2' element={<Shipping subPage='nav2' />} />
        <Route path='shipping/nav3' element={<Shipping subPage='nav3' />} />
        <Route path='shipping/nav4' element={<Shipping subPage='nav4' />} />
        <Route
          path='approval/nav1'
          element={<ApprovalDashboard subPage='nav1' />}
        />
        <Route
          path='approval/nav2'
          element={<ApprovalDashboard subPage='nav2' />}
        />
        <Route path='label' element={<Label />} />
        <Route path='user/nav1' element={<UserManagement subPage='nav1' />} />
        <Route path='user/nav2' element={<UserManagement subPage='nav2' />} />
        <Route path='mypage' element={<Mypage />} />
      </Route>
    </Routes>
  );
}
