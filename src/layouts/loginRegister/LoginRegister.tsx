import React from "react";

import { Row, Col } from "react-bootstrap";
import "./loginRegisterStyles.scss";

type propsType = {
  children: React.ReactNode | null;
};

const LoginRegister: React.FC<propsType> = (props) => {
  const { children } = props;

  return (
    <div className="layout-container m-0">
      <Row className="m-0 h-100">
        <Col xs={12} md={7} className="p-0 d-none d-md-block">
          <div>
            <div className="img-login" />
          </div>
        </Col>

        <Col xs={12} md={5} lg={5} xl={5} className="p-0 right-col">{children}</Col>
      </Row>
    </div>
  );
};

export default LoginRegister;
