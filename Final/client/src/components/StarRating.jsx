import { FaStar } from "react-icons/fa";

//StarRating component to display a star rating
const StarRating = ({rating, elementId, editable, updateRating}) => {

  //calculate the number of rate and empty stars
  const ratedStar = rating || 0
  const emptyStar = 5 - ratedStar

  return (
    <div>
    {/* render rated stars */}
    {[...Array(ratedStar)].map((_, index) => (
     <FaStar key={index} style={{fill: '#ffd700', ...(editable && {cursor: 'pointer'})}} title={`${index + 1} Rating`} onClick={()=>{editable && updateRating(elementId, index + 1)}} />
   ))}

   {/* render empty stars */}
   {[...Array(emptyStar)].map((_, index) => (
    <FaStar key={index} style={{fill: '#c0c0c0', ...(editable && {cursor: 'pointer'})}} title={`${index + ratedStar + 1} Rating`} onClick={()=>{editable && updateRating(elementId, index + ratedStar + 1)}} />
  ))}
    </div>
  )
}

export default StarRating
