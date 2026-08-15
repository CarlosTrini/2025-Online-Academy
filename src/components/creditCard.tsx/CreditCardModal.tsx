import React, { useState } from "react";
import dayjs from "dayjs";
import { DatePicker, Input, Modal, Spin } from "antd";
import { getStorageArr, saveStorage } from "../../helpers/storagesFunc";
import { namesStorage } from "../../initData/namesStorage";
import { isEmpty, isNil } from "lodash";
import { simpleAlertTimer } from "../../helpers/alerts";
import { typeUserCategory, userT } from "../../typesInterfaces/types";
import { CreditCard, X, Save } from "lucide-react";

const inputsInit = {
  name: "",
  cvv: "",
  date: dayjs().format("MM/YY"),
  number: "",
};

const userInit = {
  typeUser: "Estudiante" as typeUserCategory,
  user: "",
  email: "",
  password: "",
  id: "",
  name: "",
  lastName: "",
  favorites: [],
  subscriptions: [],
  card: [
    //     {
    //     nameOwner: '',
    //     cardNumber: '',
    //     date: '',
    //     cvv: '',
    // }
  ],
  picture: "",
};

type propsT = {
  showModal: boolean;
  setShowModal: (actionToShow: boolean) => void;
  callBackClose: ({ updateUserInfo }: { updateUserInfo: userT }) => void;
  userInfo: userT;
};

const CreditCardModal: React.FC<propsT> = ({
  showModal,
  setShowModal,
  userInfo,
  callBackClose,
}) => {
  const [inputs, setInputs] = useState(inputsInit);
  // const [showModal, setShowModal] = useState(false);
  const [loaderModal, setLoaderModal] = useState(false);

  const handleInputs = ({ id, value }: { id: string; value: string }) => {
    setInputs({
      ...inputs,
      [id]: value,
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setInputs(inputsInit);
  };

  const saveCard = () => {
    setLoaderModal(true);

    if ([...Object.values(inputs)].every((e) => e !== "") === false) {
      setLoaderModal(false);
      return simpleAlertTimer({
        title: "Todos los campos son obligatorios",
        icon: "info",
      });
    }

    // guardar la tarjeta en el usuario

    const users: userT[] = getStorageArr({ name: namesStorage.usersStorage });

    if (isNil(users) === true || isEmpty(users) === true) {
      setLoaderModal(false);
      return simpleAlertTimer({
        title: "Ha ocurrido un error intenta de nuevo o más tarde",
        icon: "error",
      });
    }

    let currentUserInfo: userT = userInit;

    const updateUsers = users.map((u) => {
      if (userInfo.id === u.id) {
        u.card?.push({
          nameOwner: inputs.name,
          cvv: inputs.cvv,
          cardNumber: inputs.number,
          date: inputs.date,
        });
        currentUserInfo = u;
      }
      return u;
    });

    saveStorage({
      name: namesStorage.usersStorage,
      value: JSON.stringify(updateUsers),
    });

    // que vuelva  a armar las cards
    // regresa las card actualizadas y el boolean para cerrar el MODAL
    callBackClose({
      updateUserInfo: currentUserInfo,
    });

    setTimeout(() => {
      setLoaderModal(false);
      closeModal();
      simpleAlertTimer({
        title: "Tarjeta agregada con éxito",
        icon: "success",
      });
    }, 1500);
  };

  return (
    <>
      <Modal
        destroyOnClose={true}
        closable={true}
        open={showModal}
        footer={null}
        onCancel={() => closeModal()}
        centered={true}
      >
        <Spin spinning={loaderModal} size="large">
          <header>
            <small>
              (la información debe ser falsa, solo respetar la estructura)
            </small>
            <p className="mb-3 fs-18 fw-bold text-dark d-flex align-items-center">
              {" "}
              <CreditCard size={18} className="me-2" /> Agregar tarjeta
            </p>
          </header>

          <section>
            <div className="mb-2">
              <p className="mb-2">Nombre del propietario</p>
              <Input
                value={inputs.name}
                id="name"
                placeholder=""
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputs({
                    id: e.target.id,
                    value: e.target.value,
                  });
                }}
              />
            </div>
            <div className="mb-2">
              <p className="mb-2">Número de tarjeta</p>
              <Input
                maxLength={18}
                value={inputs.number}
                id="number"
                placeholder=""
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputs({
                    id: e.target.id,
                    value: e.target.value,
                  });
                }}
              />
            </div>

            <div className="mb-2">
              <p className="mb-0">Fecha de vencimiento</p>
              <DatePicker
                format="MM/YY"
                // value={dayjs(inputs.date, 'MM/YY')}
                defaultValue={dayjs(inputs.date, "MM/YY")}
                placeholder="Seleccionar"
                id="date"
                onChange={(_, dateString) => {
                  handleInputs({
                    id: "date",
                    value: dateString as string,
                  });
                }}
              />
            </div>

            <div className="mb-2">
              <p className="mb-0  "> CVV </p>
              <Input
                style={{ width: "30%" }}
                maxLength={4}
                value={inputs.cvv}
                id="cvv"
                placeholder=""
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputs({
                    id: e.target.id,
                    value: e.target.value,
                  });
                }}
              />
            </div>

            <div className="text-end mt-3">
              <button
                className="btn btn-danger me-2 d-inline-flex align-items-center justify-content-center"
                onClick={() => closeModal()}
              >
                {" "}
                <X size={16} className="me-2" /> Cerrar
              </button>
              <button
                className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                onClick={() => {
                  saveCard();
                }}
              >
                {" "}
                <Save size={16} className="me-2" /> Guardar
              </button>
            </div>
          </section>
        </Spin>
      </Modal>
    </>
  );
};

export default CreditCardModal;
