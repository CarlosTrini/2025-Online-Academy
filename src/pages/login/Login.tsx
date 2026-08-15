import React, { useEffect, useState } from "react";

import LoginRegister from "../../layouts/loginRegister/LoginRegister";

import bcrypt from "bcryptjs";

import { Button } from "react-bootstrap";
import "./loginStyles.scss";
import { Input, Spin } from "antd";
import { Link, useNavigate} from "react-router-dom";
import { User, Key, Pen, LogIn } from "lucide-react";

// INTERFACES & TYPES
import type { userT, loginDataT } from "../../typesInterfaces/types";
import { isEmpty, isNil } from "lodash";
import { simpleAlertTimer } from "../../helpers/alerts";
import { getStorageArr, getStorageObj, saveStorage } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";

const userInit: userT = {
    picture: '',
    typeUser: 'Estudiante',
    user: '',
    email: '',
    password: '',
    id: '',
    name: '',
    lastName: '',
    favorites: [],
    subscriptions: [],
    card: [
    //   {
    //   cardNumber: '',
    //   cvv: '',
    //   date: '',
    //   nameOwner: ''
    // } 
  ]
}

const Login = () => {

  const NAVIGATE = useNavigate();

  const [inputsValues, setInputsValues] = useState(userInit);
  const [showLoader, setShowLoader] = useState<boolean>(false);

  const handleInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputsValues({
      ...inputsValues,
      [e.target.id]: e.target.value,
    });
  };

  const handleLogin = () => {
    setShowLoader(true);

    if (
      isNil(inputsValues.user) === true ||
      inputsValues.user === "" ||
      isNil(inputsValues.password) === true ||
      inputsValues.password === ""
    ) {
      simpleAlertTimer({
        title: "Campos incompletos",
        icon: "error",
      });
      setShowLoader(false);
      return;
    }

    // validar que existe el usuario y la contraseña
    const users: userT[] = getStorageArr({ name: namesStorage.usersStorage });

    // encontrar que el usuario exista
    const userFound: userT | undefined = users.find(
      (u) => u.user === inputsValues.user
    );

    // si el usuario no existe
    if (isNil(userFound) === true || isEmpty(userFound) === true) {
      simpleAlertTimer({
        title: "Este usuario no fue encontrado",
        icon: "error",
      });
      setShowLoader(false);
      return;
    }

    // comprobar contraseña si es que el usuario fue encontrado
    // la contraseña en el registro se le aplica un hash... aqui se comprueba ese hash...
    const checkPass = bcrypt.compareSync(
      inputsValues.password,
      userFound.password
    );

    // si la contraseña NO coincide...
    if (checkPass === false) {
       simpleAlertTimer({
        title: "Revisar el usuario o contraseña",
        icon: "error",
      });
      setShowLoader(false);
      return;
    }

    // a este punto todo está ok... se guarda data del usuario logueado en storage
    const userLogin: loginDataT = {
      idUser: userFound.id,
      login: true,
      name: userFound.name,
      typeUser: userFound.typeUser,
      userPicture: userFound.picture
    };

    saveStorage({
      name: namesStorage.loginDataStorage,
      value: JSON.stringify(userLogin)
    });

    setTimeout(() => {
      // si la contraseña SI coincide
      simpleAlertTimer({
        title: "Hola" + " " + userFound.name,
        icon: "success",
      });
      setShowLoader(false);
      NAVIGATE("/");
    }, 1500);
  };

  const resetInputs = () => {
    setInputsValues(userInit);
  };

  // PARA VER SI ESTA LOGUEADO ALGUIEN...
  useEffect(() => {

    const authInfoStorage: loginDataT = getStorageObj({
      name: namesStorage.loginDataStorage
    }) as loginDataT;

    if (isNil(authInfoStorage) === true || isEmpty(authInfoStorage) === true) {
      return;
    }

    if(authInfoStorage.login === true) {
      NAVIGATE(`/${authInfoStorage.idUser}`);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    
      <LoginRegister>
      <Spin spinning={showLoader} tip={"cargando..."}>
        <div className="login-inputs">
          {/* IMAGE */}
          <div className="img-login-right mx-auto" />
          {/* TITLE LOGIN */}
          <div>
            <h3 className="text-center text-primary">Online academy</h3>
            <p className="text-center">Bienvenido</p>
          </div>

          {/* INPUTS LOGIN */}
          {/* USER INPUT LOGIN*/}

          <div className="my-3">
            <Input
              type="text"
              autoComplete={"off"}
              placeholder="usuario"
              id="user"
              value={inputsValues.user}
              size="large"
              addonAfter={<User size={18} className="text-primary" />}
              onChange={handleInputs}
            />
          </div>
          {/* PASSWORD INPUT LOGIN */}
          <div>
            <Input
              type="password"
              autoComplete="off"
              placeholder="contraseña"
              id="password"
              value={inputsValues.password}
              size="large"
              addonAfter={<Key size={18} className="text-primary" />}
              onChange={handleInputs}
            />
          </div>

          {/* BUTTONS LOGIN */}
          <div className="mt-3 d-flex justify-content-evenly ">
              <Button
                variant="outline-secondary"
                id="registerrrr"
                className="d-flex align-items-center"
                onClick={() => {
                  resetInputs();
                  const registerLink = document.getElementById('goRegisterBtn');
                if (isNil(registerLink) === false) {
                  registerLink.click();
                }
                }}
              >
                <Pen size={16} className="me-2" />
                Registrarme
            <Link to={"/register"} className="d-none" id="goRegisterBtn"/>
              </Button>

            <Button variant="primary" className="d-flex align-items-center" onClick={handleLogin}>
              <LogIn size={16} className="me-2" />
              Entrar
            </Button>
          </div>

          <div className="text-center">
                <button className='btn btn-link'>
                    <Link to={'/'} >Continuar sin sesión</Link>
                </button>
              </div>
        </div>
      </Spin>
    </LoginRegister>
      
    </>
  );
};

export default Login;
