import {formTypes} from '../../data/forms'
import { CardContainer, CardWrapper, CardTitle,CardIcon } from './style';

const Home = () => {
    return <div>
        <CardContainer>
      {formTypes.map((form) => (
        <CardWrapper key={form.id}>
        <CardIcon src={form.icon} alt={form.name} />
          <CardTitle>{form.name}</CardTitle>
        </CardWrapper>
      ))}
    </CardContainer>
    </div>;
};

export default Home;
