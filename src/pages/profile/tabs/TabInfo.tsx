import React, { useEffect, useRef, useState } from "react";
import { userT } from "../../../typesInterfaces/types";
import { Input, Spin } from "antd";
import { isEmpty, isNil } from "lodash";
import { simpleAlertTimer } from "../../../helpers/alerts";
import bcryptjs from "bcryptjs";
import { getStorageArr, saveStorage } from "../../../helpers/storagesFunc";
import { namesStorage } from "../../../initData/namesStorage";
import { Type, User, Mail, Key, Eye, Camera, Trash2, Save } from "lucide-react";

import "../userProfile.scss";

type props = {
  userInfo: userT;
  callback: () => void;
};

type inputsT = {
  name: string;
  lastName: string;
  user: string;
  email: string;
  password: string;
  confirmPassword: string;
  picture: string;
};

const inputsInit = {
  name: "",
  lastName: "",
  user: "",
  email: "",
  password: "",
  confirmPassword: "",
  picture: "",
};

const TabInfo: React.FC<props> = ({ userInfo, callback }) => {
  const {
    // typeUser,
    // password,
    // id,
    // favorites,
    // subscriptions,
    // card,
    user,
    email,
    name,
    lastName,
    picture,
  } = userInfo;

  const inputRef = useRef<HTMLInputElement>(null);

  const [isUpdateActive, setIsUpdateActive] = useState(false);
  const [inputsValues, setInputsValues] = useState<inputsT>(inputsInit);
  const [loader, setLoader] = useState(false);
  const [newImage, setNewImage] = useState<string | undefined>(undefined);

  const [inputsValueRollback, setInputsValuesRollback] =
    useState<inputsT>(inputsInit);

  const handleInputs = ({
    idName,
    value,
  }: {
    idName: string;
    value: string;
  }) => {
    setInputsValues({
      ...inputsValues,
      [idName]: value,
    });
    setIsUpdateActive(true); // se activa al modificar cualquier campo...
  };

  const showPassword = (inputId: string) => {
    const passInput = document.getElementById(inputId) as HTMLInputElement;
    if (isNil(passInput) === true) {
      return;
    }

    const types: { [key: string]: string } = {
      password: "text",
      text: "password",
    };
    const currentType = passInput.type;
    passInput.type = types[currentType];
  };

  const encriptPassword = (pass: string): string => {
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(pass, salt);

    return hash;
  };

  const getUser = (id: userT["id"]): userT | undefined => {
    const usersStorage = getStorageArr({
      name: namesStorage.usersStorage,
    }) as userT[];

    if (isEmpty(usersStorage) === true || isNil(usersStorage) === true) {
      simpleAlertTimer({ title: "Ha ocurrido un error", icon: "info" });
      return undefined;
    }

    const user = usersStorage.find((u) => u.id === id);

    return user || undefined;
  };

  const updateUser = (newUser: userT) => {
    const usersStorage = getStorageArr({
      name: namesStorage.usersStorage,
    }) as userT[];

    if (isEmpty(usersStorage) === true || isNil(usersStorage) === true) {
      return simpleAlertTimer({ title: "Ha ocurrido un error", icon: "info" });
    }

    const newUsers = usersStorage.map((u) => {
      if (u.id === newUser.id) {
        return newUser;
      }
      return u;
    });

    saveStorage({
      name: namesStorage.usersStorage,
      value: JSON.stringify(newUsers),
    });
  };

  const saveInfo = () => {
    // revisar campos vacios (solo se permiten vacios los inputs de contraseña y picture)
    let encryptPass = "";
    const { confirmPassword, password, email, lastName, name, picture, user } =
      inputsValues;
    const checkInputs = [email, lastName, name, user].every(
      (v) => v.trim() !== ""
    );

    if (checkInputs === false) {
      return simpleAlertTimer({
        title:
          "Campos: Nombre, Apellidos, Usuario y Correo electrónico, son obligatorios",
        icon: "error",
        timer: 2000,
      });
    }

    // si esos campos ok... evaluar si hubo cambio en las contraseñas...
    if (password.trim() !== "") {
      // si es diferente de vacía quiere decir que la modificó... revisar ahora la confirmación
      if (password.trim() !== confirmPassword.trim()) {
        return simpleAlertTimer({
          title: "Ambas contraseñas deben ser iguales",
          icon: "warning",
        });
      }

      // las contraseñas son iguales, ahora, a encriptar
      encryptPass = encriptPassword(password);
    }

    // TODO: PENDIENTE EL PICTURE

    // ir a buscar al usuario...

    //crear el nuevo obj de usuario
    const currentUser = getUser(userInfo.id);

    if (isEmpty(currentUser) === true || isNil(currentUser) === true) {
      return simpleAlertTimer({ title: "Ha ocurrido un error", icon: "info" });
    }
    setLoader(true);

    const newUser: userT = {
      ...currentUser,
      password: encryptPass !== "" ? encryptPass : currentUser.password,
      email,
      lastName,
      name,
      picture,
      user,
    };

    updateUser(newUser);

    //Los cambios se verán reflejados al recargar la página..
    setTimeout(() => {
      setLoader(false);
      setNewImage(undefined);
      simpleAlertTimer({
        title: "Algunos cambios se mostrarán al reiniciar sesión",
        icon: "info",
        timer: 2500,
      });
      callback();
    }, 1500);
  };

  const resetInfo = () => {
    setInputsValues(inputsValueRollback);
    setIsUpdateActive(false);
    setNewImage(undefined);
  };

  useEffect(() => {
    if (isNil(userInfo) === false && isEmpty(userInfo) === false) {
      const values = {
        name: name,
        lastName: lastName,
        user: user,
        email: email,
        password: "",
        confirmPassword: "",
        picture: picture,
      };

      setInputsValues(values);
      setInputsValuesRollback(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return (
    <>
      <Spin spinning={loader} size="large">
        <header>
          <p className="fw-bold fs-18 text-center text-50">
            Agrega o edita tu Información
          </p>
        </header>

        <section className="w-sections">
          <div>
            <Input
              type="text"
              id="name"
              size="large"
              addonBefore={
                <>
                  <Type size={16} className="text-primary" />
                </>
              }
              placeholder="Nombre"
              value={inputsValues.name}
              onChange={(e) => {
                handleInputs({
                  idName: e.target.id,
                  value: e.target.value,
                });
              }}
            />
          </div>
          <div>
            <Input
              type="text"
              id="lastName"
              size="large"
              className="mt-3"
              addonBefore={
                <>
                  <Type size={16} className="text-primary" />
                </>
              }
              placeholder="Apellidos"
              value={inputsValues.lastName}
              onChange={(e) => {
                handleInputs({
                  idName: e.target.id,
                  value: e.target.value,
                });
              }}
            />
          </div>
          <div>
            <Input
              type="text"
              id="user"
              size="large"
              className="mt-3"
              addonBefore={
                <>
                  <User size={16} className="text-primary" />
                </>
              }
              placeholder="Usuario"
              value={inputsValues.user}
              onChange={(e) => {
                handleInputs({
                  idName: e.target.id,
                  value: e.target.value,
                });
              }}
            />
          </div>
          <div>
            <Input
              type="text"
              id="email"
              size="large"
              className="mt-3"
              addonBefore={
                <>
                  <Mail size={16} className="text-primary" />
                </>
              }
              placeholder="Correo electrónico"
              value={inputsValues.email}
              onChange={(e) => {
                handleInputs({
                  idName: e.target.id,
                  value: e.target.value,
                });
              }}
            />
          </div>

          <div>
            <Input
              type="password"
              id="password"
              size="large"
              className="mt-3"
              addonBefore={
                <>
                  <Key size={16} className="text-primary" />
                </>
              }
              addonAfter={
                <>
                  <button
                    className="btn p-0 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      showPassword("password");
                    }}
                  >
                    <Eye size={16} className="text-primary" />
                  </button>
                </>
              }
              placeholder="Contraseña"
              value={inputsValues.password}
              onChange={(e) => {
                handleInputs({
                  idName: e.target.id,
                  value: e.target.value,
                });
              }}
            />
          </div>

          <div>
            <Input
              type="password"
              id="confirmPassword"
              size="large"
              className="mt-3"
              addonBefore={
                <>
                  <Key size={16} className="text-primary me-1" />
                  <Key size={16} className="text-primary" />
                </>
              }
              addonAfter={
                <>
                  <button
                    className="btn p-0 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      showPassword("confirmPassword");
                    }}
                  >
                    <Eye size={16} className="text-primary" />
                  </button>
                </>
              }
              placeholder="Confirmar contraseña"
              value={inputsValues.confirmPassword}
              onChange={(e) => {
                handleInputs({
                  idName: e.target.id,
                  value: e.target.value,
                });
              }}
            />
          </div>

          <div className="mb-3 mt-4">
            <input
              id="picture"
              className=""
              type="file"
              style={{ display: "none" }}
              accept="image/png, image/jpeg"
              ref={inputRef}
              onChange={(e: React.ChangeEvent<HTMLInputElement & { files: FileList }>) => {
                const file = e.target.files[0];

                // CONVERTIR A BASE 64
                const reader = new FileReader();
                reader.onload = () => {
                  const base64Image = reader.result;
                  handleInputs({
                    idName: "picture",
                    value: base64Image as string,
                  });
                };
                reader.readAsDataURL(file);

                // RUTA LOCAL PARA QUE SE MUESTRE EL PREVIEW
                setNewImage(URL.createObjectURL(file) || undefined);

                if (isNil(file) === true || isEmpty(file) === true) {
                  return;
                }
              }}
            />

            {isNil(newImage) === false && newImage !== "" && (
              <div className="new-img text-center">
                <img src={newImage} alt="" className="rounded" />
              </div>
            )}

            <div className="mt-3 text-center">
              <button
                className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center"
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                <Camera size={16} className="me-2" />
                Nueva foto de perfil
              </button>
            </div>
          </div>
        </section>

        <div className="mt-3 text-end d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-danger d-inline-flex align-items-center justify-content-center"
            style={{
              cursor: isUpdateActive === false ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              if (isUpdateActive === false) return;
              resetInfo();
            }}
          >
            <Trash2 size={16} className="me-2" />
            Borrar cambios
          </button>
          <button
            className="btn btn-primary d-inline-flex align-items-center justify-content-center"
            style={{
              cursor: isUpdateActive === false ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              if (isUpdateActive === false) return;
              saveInfo();
            }}
          >
            <Save size={16} className="me-2" />
            Guardar cambios
          </button>
        </div>
      </Spin>
    </>
  );
};

export default TabInfo;
