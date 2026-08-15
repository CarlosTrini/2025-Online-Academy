import React, { useEffect, useState } from "react";

import "./cardAndToolCourse.scss";
import { cardCourseT } from "../../typesInterfaces/types";
import emptyImage from "../../assets/no-image.png";
import { isNil } from "lodash";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import TooltipCard from "./TooltipCard";
import { Star, User, Users } from "lucide-react";

type propsT = cardCourseT & {
  open: boolean;
}

const CardCourse: React.FC<propsT> = (infoCard) => {
  const {
    imageCourse,
    price,
    score,
    titleCourse,
    discountPrice,
    studentsQty,
    teacherName,
    open
  } = infoCard;

  const [scoreIcons, setScoreIcons] = useState<boolean[]>([]);

  const makeStars = () => {
    const fillStarsArr = score;
    const emptyStars = 5 - fillStarsArr;
    const starsArr = [
      ...Array(fillStarsArr).fill(true),
      ...Array(emptyStars).fill(false),
    ];

    setScoreIcons(starsArr);
  };

  const infoCardHtml = () => {
    return (
      <>
         <div className="card-container">
              <div className="card-image">
                <img src={imageCourse || emptyImage} alt="" />
              </div>
              <div className="card-content mt-2">
                <header className="mb-3">
                  <p className="fw-bold fs-20 mb-1">
                      <Link to={`/course/by-name/${titleCourse}`}> {
                        titleCourse.length > 50
                          ? `${titleCourse.substring(0, 50)}...`
                          : titleCourse
                        }</Link>
                      </p>
                  <div className="d-flex justify-content-between align-items-center fs-12 mt-2">
                      <span className="card-teacher d-flex align-items-center">
                      <User size={14} className="me-1" />
                      {teacherName}
                      </span>
                      <span className="card-students me-1 d-flex align-items-center" title="estudiantes">
                      <Users size={14} className="me-1" />
                      {`(${studentsQty})`}
                      </span>
                  </div>
                </header>

                <div className=" d-flex justify-content-between align-items-center">
                  <p className="mb-0 fs-18">
                    {" "}
                    {discountPrice !== '0' && isNil(discountPrice) === false ? (
                      <>
                        {" "}
                        ${discountPrice}{" "}
                        <span className="card-discount">{price}</span>{" "}
                      </>
                    ) : (
                      <> ${price} </>
                    )}{" "}
                  </p>
                  <div className="d-flex align-items-center gap-1">
                    {scoreIcons.map((isFilled, i) => (
                      <span className="mb-0 fs-12 d-flex" key={i}>
                        <Star size={14} className={isFilled ? 'text-warning' : 'text-secondary'} fill={isFilled ? "#ffc107" : "none"} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
      </>
    );
  }


  useEffect(() => {
    makeStars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, score]);

  return (
    <>
      {
        open === true && (

          <Tooltip  
              color="#30303510" 
              // style={{background: 'blue'}} 
              title={<TooltipCard {...infoCard} />}
            >
            {infoCardHtml()}
          </Tooltip>
        )
      }

      {
        open === false && (
          infoCardHtml()
        )
      }
    </>
  );
};

export default CardCourse;
