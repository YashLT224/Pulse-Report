// Add an icon to the card
import { FaFileAlt } from 'react-icons/fa'; // Install react-icons if needed

const Home = () => {
  return (
    <CardContainer>
      {formTypes.map((form) => (
        <CardWrapper key={form.id}>
          <FaFileAlt size={32} color="#007bff" />
          <CardTitle>{form.name}</CardTitle>
        </CardWrapper>
      ))}
    </CardContainer>
  );
};