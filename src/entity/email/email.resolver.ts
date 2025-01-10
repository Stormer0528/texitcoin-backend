import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { pubSub } from '@/pubsub';
import {
  CreateEmailInput,
  EmailQueryArgs,
  EmailResponse,
  SendEmailInput,
  UpdateEmailInput,
} from './email.type';
import { Email } from './email.entity';
import { EmailService } from './email.service';
import { SuccessResult } from '@/graphql/enum';
import { emailAccess } from '@/graphql/middlewares';
import { RecipientService } from '../recipient/recipient.service';
import { EmailAttachmentService } from '../emailAttachment/emailAttachment.service';
import { ROUTING_NEW_EMAIL } from '@/consts/subscription';
import { NewEmailInterface } from '../recipient/recipient.type';
import { Member } from '../member/member.entity';
import { Recipient } from '../recipient/recipient.entity';
import { PFile } from '../file/file.entity';

@Service()
@Resolver(() => Email)
export class EmailResolver {
  constructor(
    private readonly service: EmailService,
    private readonly recipientService: RecipientService,
    private readonly emailAttachmentService: EmailAttachmentService
  ) {}

  @Authorized()
  @Query(() => EmailResponse)
  async emails(
    @Args() query: EmailQueryArgs,
    @Info() info: GraphQLResolveInfo,
    @Ctx() context: Context
  ): Promise<EmailResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    if (!context.isAdmin) {
      query.filter = {
        AND: [query.filter, { senderId: context.user.id }],
      };
    }

    let promises: { total?: Promise<number>; emails?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getEmailsCount(query);
    }

    if ('emails' in fields) {
      promises.emails = this.service.getEmails(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; emails?: Email[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.MEMBER])
  @Transaction()
  @Mutation(() => Email)
  async createEmail(@Arg('data') data: CreateEmailInput, @Ctx() context: Context): Promise<Email> {
    const { fileIds, ...restData } = data;

    return this.service.createEmail({
      ...restData,
      senderId: context.user.id,
      emailAttachment: {
        createMany: {
          data: fileIds ? fileIds.map((fileId) => ({ fileId })) : [],
        },
      },
    });
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(emailAccess())
  @Transaction()
  @Mutation(() => Email)
  async updateEmail(@Arg('data') data: UpdateEmailInput): Promise<Email> {
    const { id, fileIds, ...rest } = data;
    if (fileIds) {
      await this.emailAttachmentService.setEmailAttachments({
        emailId: id,
        fileIds,
      });
    }

    return this.service.updateEmail(id, rest);
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(emailAccess())
  @Transaction()
  @Mutation(() => Email)
  async sendEmail(@Arg('data') data: SendEmailInput): Promise<SuccessResponse> {
    const { id, recipientIds } = data;
    const email = await this.service.updateEmail(id, {
      isDraft: false,
    });

    await this.recipientService.createRecipients(
      recipientIds.map((recipientId) => ({ emailId: id, recipientId }))
    );

    pubSub.publish(ROUTING_NEW_EMAIL, {
      email,
      recipientIds,
    } as NewEmailInterface);

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(emailAccess())
  @Mutation(() => Email)
  async removeEmail(@Arg('data') data: IDInput): Promise<Email> {
    return this.service.updateEmail(data.id, {
      deletedAt: new Date(),
    });
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(emailAccess())
  @Mutation(() => Email)
  async moveEmailToTrash(@Arg('data') data: IDInput): Promise<Email> {
    return this.service.updateEmail(data.id, {
      isDeleted: true,
    });
  }

  @Authorized([UserRole.MEMBER])
  @UseMiddleware(emailAccess())
  @Mutation(() => Email)
  async restoreEmailFromTrash(@Arg('data') data: IDInput): Promise<Email> {
    return this.service.updateEmail(data.id, {
      isDeleted: false,
    });
  }

  @FieldResolver(() => Member, { nullable: true })
  async sender(@Root() email: Email, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('senderForEmailLoader').load(email.senderId);
  }

  @FieldResolver(() => [Recipient], { nullable: true })
  async recipients(@Root() email: Email, @Ctx() ctx: Context): Promise<Recipient[]> {
    return ctx.dataLoader.get('recipientsForEmailLoader').load(email.id);
  }

  @FieldResolver(() => [PFile], { nullable: true })
  async files(@Root() email: Email, @Ctx() ctx: Context): Promise<PFile[]> {
    return ctx.dataLoader.get('filesForEmailLoader').load(email.id);
  }
}
