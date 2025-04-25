import { useSelector } from 'react-redux';
import { formTypes } from '../../data/forms';
import { CardContainer, CardWrapper, CardTitle, CardIcon } from './style';
import { Message } from '@aws-amplify/ui-react';
import { Loader } from '@aws-amplify/ui-react';

const Home = () => {
    const { userProfile, isLoading } = useSelector(
        (state: any) => state.authReducer
    );

    const allowedForms = userProfile?.allowedForms || [];
    const FilteredAccessedForm = allowedForms.map(form => form.split('#')[0]);
    const isAdmin = userProfile?.role === 'admin';

    console.log(allowedForms)

    return (
        <div>
            <CardContainer>
                {(FilteredAccessedForm.length > 0 || isAdmin) &&
                    !isLoading &&
                    formTypes
                        .filter(
                            form => FilteredAccessedForm.includes(form.label) || isAdmin
                        )
                        .map(form => {
                            // Get access type (if present) from allowedForms
                            const accessType = allowedForms.find(f => f.startsWith(form.label))?.split('#')[1] || 'READ'; // Default to 'READ'
                
                            return (
                                <CardWrapper to={form.route} key={form.id}>
                                    <CardIcon src={form.icon} alt={form.name} />
                                    <CardTitle>{form.name}</CardTitle>
                                </CardWrapper>
                            );
                        })
                }
                {!allowedForms.length && !isLoading && !isAdmin && (
                    <Message
                        variation="filled"
                        colorTheme="info"
                        heading="Access Required"
                    >
                        Please reach out to an administrator to request access
                        to Reports.
                    </Message>
                )}
                {isLoading && (
                    <Loader
                        height={'80px'}
                        size="large"
                        emptyColor="#007aff"
                        filledColor="white"
                    />
                )}
            </CardContainer>
        </div>
    );
};

export default Home;
