import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class ManyEmailAttachmentsInput {
  @Field(() => ID)
  emailId: string;

  @Field(() => [ID])
  fileIds: string[];
}
