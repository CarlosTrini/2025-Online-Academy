import React from "react";
import { coursesT, teacherT } from "../../../typesInterfaces/types";
import { Link } from "react-router-dom";

import "../userProfile.scss";
import { Tooltip } from "antd";
import { addToFavorites, delToFavorites } from "../../../helpers/favoritesActions";
import { Eye, Heart, HeartOff } from "lucide-react";
import { getStorageArr } from "../../../helpers/storagesFunc";
import { namesStorage } from "../../../initData/namesStorage";

type propsT = {
  course: coursesT;
  isFavoriteTab: boolean;
  callback: () => void
};

const teachers = getStorageArr({name: namesStorage.teachersStorage}) as teacherT[];


const LongCard: React.FC<propsT> = ({ course, isFavoriteTab, callback }) => {

  const teacherName = (idTeacher: teacherT['id']) => {
    const findTeacher = teachers.find(t => t.id === idTeacher);
    return findTeacher?.name || 'Desconocido';
  }


  return (
    <>
      <div className="course-card-long">
        <p className="text-primary fs-22 "> {course.title} </p>

        <div className="d-flex">
          <div className="img-card-long  me-3">
            <img src={course.image} alt="" />
          </div>
          <div>
            <p className="mb-2 fw-bold">
              Instructor: <span className="fw-normal">{teacherName(course.idTeacher)}</span>{" "}
            </p>
            <p className="mb-2 fw-bold">
              Categoría: <span className="fw-normal">{course.category}</span>{" "}
            </p>
            <p className="mb-2 fw-bold">
              Duración:{" "}
              <span className="fw-normal">{course.courseDuration} Hrs</span>{" "}
            </p>

            <p className="mb-2 fw-bold">
              Última actualización:{" "}
              <span className="fw-normal">{course.lastUpdated}</span>{" "}
            </p>
            <p className="mb-2 fw-bold">
              Nivel: <span className="fw-normal">{course.level}</span>{" "}
            </p>
          </div>
          <div className="align-self-end flex-grow-1 text-end">
            <Tooltip title="Ver">
              <Link to={`/course/by-name/${course.title}`}>
                <button className="btn btn-primary me-2 d-inline-flex align-items-center justify-content-center">
                  <Eye size={18} />
                </button>
              </Link>
            </Tooltip>
            {isFavoriteTab === false && (
              <Tooltip title="Añadir a favoritos">
                <button
                  className="btn btn-danger d-inline-flex align-items-center justify-content-center"
                  onClick={() => {
                    addToFavorites(course.id);
                    setTimeout(() => {
                        callback();
                    },1400);
                  }}
                >
                  <Heart size={18} />
                </button>
              </Tooltip>
            )}
            {isFavoriteTab === true && (
              <Tooltip title="Eliminar de favoritos"
              >
                <button className="btn btn-warning d-inline-flex align-items-center justify-content-center"
                    onClick={() => {
                        delToFavorites(course.id);
                        setTimeout(() => {
                            callback();
                        },1400);
                        
                    }}
                >
                  <HeartOff size={18} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LongCard;
