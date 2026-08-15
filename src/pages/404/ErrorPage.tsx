import { Link } from "react-router-dom";


import notFoundImage from '../../assets/error-404.png';
import { Home } from "lucide-react";

export default function  ErrorPage() {

  return (
    <div id="error-page" className="text-center">


      <h1 className="fw-bold text-danger">Oops!</h1>

      <div
        style={{
          width: 300,
          height: 300,
          margin: 'auto'
        }}
      >
        <img src={notFoundImage} alt="" style={{
          width: 300,
          height: 300
        }}
        />
      </div>

      <p className="mb-0 fw-bold fs-22">Ha ocurrido un error</p>
      <p className="mb-0 fw-bold fs-22">Recargue la página o inicie sesión nuevamente</p>

      <div className="mt-3">
        <Link to={'/'}>
          <button className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center">
            <Home size={18} className="me-2" />
            Ir a la página de inicio
          </button>
        </Link>
      </div>
    </div>
  );
}