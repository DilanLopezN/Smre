import { CompleteChannelConfig } from '../../channel-config/channel-config.service';
import { StartMember } from '../dto/create-multiple-conversation';
import { User } from './../../users/interfaces/user.interface';
import { Contact } from '../../contact/interface/contact.interface';
import { Team } from '../../team/interfaces/team.interface';

export interface AgentCreateConversationEventData {
    workspaceId: string;
    team: Team;
    channelConfig: CompleteChannelConfig;
    userAuth: User;
    templateId: string;
    startMember: StartMember;
    contact?: Contact;
    shouldCloseConversation: boolean;
}
