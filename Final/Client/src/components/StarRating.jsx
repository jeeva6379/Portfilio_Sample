import { FaStar } from "react-icons/fa";


const StarRating = ({rating, elementId, editable, updateRating}) => {

  const ratedStar = rating || 0
  const emptyStar = 5 - ratedStar

  return (
    <div>
    {[...Array(ratedStar)].map((_, index) => (
     <FaStar key={index} style={{fill: '#ffd700', ...(editable && {cursor: 'pointer'})}} title={`${index + 1} Rating`} onClick={()=>{editable && updateRating(elementId, index + 1)}} />
   ))}
   {[...Array(emptyStar)].map((_, index) => (
    <FaStar key={index} style={{fill: '#c0c0c0', ...(editable && {cursor: 'pointer'})}} title={`${index + ratedStar + 1} Rating`} onClick={()=>{editable && updateRating(elementId, index + ratedStar + 1)}} />
  ))}
    </div>
  )
}

export default StarRating
