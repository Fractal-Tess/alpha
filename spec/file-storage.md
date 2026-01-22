# File Storage & Download

```typescript
// packages/convex/functions/documents.ts

// Get download URL for original file
export const getDownloadUrl = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");

    // Verify ownership
    const identity = await ctx.auth.getUserIdentity();
    if (doc.userId !== identity?.subject) {
      throw new Error("Unauthorized");
    }

    // Generate signed download URL
    return await ctx.storage.getUrl(doc.storageId);
  },
});

// Upload file and create document record
export const uploadFile = mutation({
  args: {
    subjectId: v.id("subjects"),
    folderId: v.optional(v.id("folders")),
    name: v.string(),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", identity.subject))
      .unique();

    return await ctx.db.insert("documents", {
      userId: user!._id,
      subjectId: args.subjectId,
      folderId: args.folderId,
      name: args.name,
      storageId: args.storageId,
      mimeType: args.mimeType,
      size: args.size,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});
```
