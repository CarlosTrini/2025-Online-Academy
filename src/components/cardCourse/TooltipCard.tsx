import React, { useState, useEffect, useContext } from "react";
import { cardCourseT } from "../../typesInterfaces/types";
import moment from "moment";
import { isNil } from "lodash";
import './cardAndToolCourse.scss';
import { CartContextHook } from "../../context/CartContextProvider";
import { addToFavorites } from "../../helpers/favoritesActions";
import { ChevronRight, Plus, Heart } from "lucide-react";

type propsT = cardCourseT & {
  open: boolean;
}

const TooltipCard:React.FC<propsT> = (infoCard) => {
  const {
    duration,
    level,
    idCourse,
    idTeacher,
    imageCourse,
    price,
    // category,
    // score,
    // studentsQty,
    titleCourse,
    discountPrice,
    teacherName,
    lastUpdated,
    shortDescription,
    skills,
  } = infoCard;

  const {updateCartCtx} = useContext(CartContextHook);
  const [levelArrows, setLevelArrows] = useState<boolean[]>([]);

  const makeLevelArrows = () => {
    // 'Básico', 'Intermedio', 'Avanzado',
    const levelObj = {
      'Básico': [true, false, false], 
      'Intermedio': [true, true, false],  
      'Avanzado': [true, true, true],
    };

    setLevelArrows(levelObj[level as keyof typeof levelObj]);
  }

  useEffect(() => {
    if (isNil(level) === false) {
      makeLevelArrows();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  return (
    <>
    {
        <div className={`p-3 tool-container`}>
          <p className="fs-18 fw-bold">
            {titleCourse}
          </p>
          <div className="d-flex justify-content-between">
            <p className="mb-0 fs-12 t-font-white">
              Actualización:  <span className="fw-bold"> {moment(lastUpdated, 'DD-MM-YYYY').format('MMMM D, YYYY')}</span>
            </p>
            <p className="mb-0 fs-12 t-font-white">
              Duración: <span className="fw-bold"> {duration} horas</span>
            </p>
          </div>
    
          <div className="my-3 d-flex align-items-center">
            <p className="mb-0 fs-14 d-flex align-items-center">
              <span className="me-2 text-secondary">Nivel</span>
              <span className="fw-bold me-2"> {level} </span>
              <span className="d-flex align-items-center" style={{ marginLeft: '-4px' }}>
              {levelArrows.map((isFilled, i) => (
                <ChevronRight key={i} size={16} className={`${isFilled ? 'text-warning' : 'text-secondary'}`} style={{ marginLeft: '-8px' }} />
              ))}
              </span>
            </p>
          </div>
    
          <div className="fs-14">
            <p className="mb-1 text-right fw-bold tool-short-desc" >
              {shortDescription}
            </p>
            <ul>
              {
                skills.map(s => {
                  return (
                    <li>{s}</li>
                  );
                })
              }
            </ul>
          </div>
    
          <div className="text-end mt-4 d-flex justify-content-end gap-2">
            <button className="btn btn-primary d-flex align-items-center justify-content-center rounded-pill px-4 shadow-sm"
              style={{ transition: 'all 0.2s', fontWeight: 500 }}
              onClick={() => {
                const addCourse = {
                  idCourse,
                  imageCourse,
                  idTeacher,
                  titleCourse,
                  price,
                  discountPrice,
                  teacherName, 
                  isRepeated: false
                }
                updateCartCtx(addCourse);
              }}
            >
              <Plus size={16} className="me-2" />
              Añadir al carrito
            </button>
            <button className="btn btn-outline-danger d-flex align-items-center justify-content-center rounded-circle p-0 shadow-sm"
              style={{ width: '40px', height: '40px', transition: 'all 0.2s' }}
              onClick={() => {
                addToFavorites(idCourse);
              }}
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
    }
    </>
  );
};

// falta duracion, nivel

export default TooltipCard;
