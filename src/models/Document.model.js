import mongoose from 'mongoose';

const documentSchema = mongoose.Schema(
  {
    title: String,
    content: String,
    sender: { type: String, enum: ['manager', 'employee'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: String,
    sharedWithTeam: [String],
    editAccessRoles: [
      {
        type: String,
        enum: ['Head', 'Senior', 'Junior', 'All'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
