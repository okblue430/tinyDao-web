// routes
import { BrowserRouter as Router } from "react-router-dom";
import './App.css';
import { PublicRoutes } from "routes";

function App({children}) {

  return (
    <div className="App">
      <Router>
        <PublicRoutes>
          {children}
        </PublicRoutes>
      </Router>
    </div>
  );
}

export default App;
