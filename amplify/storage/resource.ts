import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'amplifyPulseReport',
    access: allow => ({
        'forms/vehicleInsurance/{entity_id}/*': [
            allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
            allow.entity('identity').to(['read', 'write', 'delete']),
            allow.authenticated.to(['read'])
        ]
    })
});
