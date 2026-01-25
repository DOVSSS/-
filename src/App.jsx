import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/router/AppRouter';
import InitAuth from './components/Auth/InitAuth'; // <-- ДОБАВЬ ЭТО
import InstallPrompt from './components/PWA/InstallPrompt'; 
import OfflineStatus from './components/PWA/OfflineStatus';
import AuthSync from './components/Auth/AuthSync'; 

function App() {
  return (
    
      <InitAuth> {/* <-- ОБЕРНИ В InitAuth */}
       <AuthSync />
        <OfflineStatus />
        <AppRouter />
        <InstallPrompt />
      </InitAuth>
    
  );
}

export default App;