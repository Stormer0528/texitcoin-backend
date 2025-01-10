import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  FieldResolver,
  Ctx,
  Root,
  UseMiddleware,
  Subscription,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { IDInput } from '@/graphql/common.type';
import {
  EmailStatusInput,
  NewEmailInterface,
  RecipientQueryArgs,
  RecipientResponse,
} from './recipient.type';
import { Recipient } from './recipient.entity';
import { RecipientService } from './recipient.service';
import { recipientAccess } from '@/graphql/middlewares';
import { Email } from '../email/email.entity';
import { ROUTING_NEW_EMAIL } from '@/consts/subscription';
import { Member } from '../member/member.entity';

@Service()
@Resolver(() => Recipient)
export class RecipientResolver {
  constructor(private readonly service: RecipientService) {}

  @Query(() => RecipientResponse)
  async recipients(
    @Args() query: RecipientQueryArgs,
    @Info() info: GraphQLResolveInfo,
    @Ctx() context: Context
  ): Promise<RecipientResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    if (!context.isAdmin) {
      query.filter = {
        AND: [query.filter, { senderId: context.user.id }],
      };
    }

    let promises: { total?: Promise<number>; recipients?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getRecipientsCount(query);
    }

    if ('recipients' in fields) {
      promises.recipients = this.service.getRecipients(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; recipients?: Recipient[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Subscription(() => Email, {
    topics: ROUTING_NEW_EMAIL,
    filter: ({ payload, context }: { payload: NewEmailInterface; context: Context }) => {
      return (
        !context.isAdmin &&
        payload.recipientIds.some((recipientId) => recipientId === context.user.id)
      );
    },
  })
  async newEmailReceived(@Root() root: NewEmailInterface): Promise<Email> {
    return root.email;
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(recipientAccess())
  @Mutation(() => Recipient)
  async setRecipientStatus(@Arg('data') data: EmailStatusInput): Promise<Recipient> {
    return this.service.updateRecipient(data.id, data);
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(recipientAccess())
  @Mutation(() => Recipient)
  async removeRecipient(@Arg('data') data: IDInput): Promise<Recipient> {
    return this.service.updateRecipient(data.id, {
      deletedAt: new Date(),
    });
  }

  @FieldResolver(() => Email, { nullable: true })
  async email(@Root() recipient: Recipient, @Ctx() ctx: Context): Promise<Email> {
    return ctx.dataLoader.get('emailForRecipientLoader').load(recipient.emailId);
  }

  @FieldResolver(() => Member, { nullable: true })
  async recipient(@Root() recpt: Recipient, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('recipientForRecipientLoader').load(recpt.recipientId);
  }
}
