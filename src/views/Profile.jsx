import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AvatarDialog } from '@/components/profile/AvatarDialog';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { ProfileCardsSkeleton } from '@/components/profile/ProfileCardsSkeleton';
import { ProfileDraftsTab } from '@/components/profile/ProfileDraftsTab';
import { ProfileFavoritesTab } from '@/components/profile/ProfileFavoritesTab';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileMetricsDialog } from '@/components/profile/ProfileMetricsDialog';
import { ProfilePostsTab } from '@/components/profile/ProfilePostsTab';
import { ProfileTabsNav } from '@/components/profile/ProfileTabsNav';
import { ReviewsDialog } from '@/components/profile/ReviewsDialog';
import { useChats } from '@/context/ChatContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useProfile } from '@/hooks/useProfile';

export function Profile() {
  const profile = useProfile();
  const { toggleFavorite } = useFavorites();
  const { chats } = useChats();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = ['posts', 'drafts', 'favorites'].includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'posts';

  const handleTabChange = (tab) => {
    setSearchParams(tab === 'posts' ? {} : { tab });
  };

  if (!profile.user) return null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <Helmet>
        <title>Mi Perfil | Vitrina</title>
        <meta name="description" content="Gestiona tu cuenta, tus publicaciones activas, tus borradores y tus productos favoritos en Vitrina." />
      </Helmet>

      <ProfileHeader
        user={profile.user}
        reviewScore={profile.reviewData.score}
        reviewCount={profile.reviewData.count}
        onEditAvatar={profile.handleOpenAvatarDialog}
        onEditProfile={profile.handleOpenEditProfile}
        onOpenReviews={() => profile.setIsReviewsOpen(true)}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-6">
        <ProfileTabsNav
          userPostsCount={profile.userPosts.length}
          draftsCount={profile.drafts.length}
          favoritesCount={profile.favPosts.length}
        />

        {profile.loading ? (
          <div className="flex flex-col gap-4">
            <span className="sr-only">Cargando información del perfil...</span>
            <ProfileCardsSkeleton />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <TabsContent value="posts" className="mt-0 outline-none">
              <ProfilePostsTab
                posts={profile.userPosts}
                sellerChats={profile.sellerChats}
                chats={chats}
                onEditPost={(post) => navigate(`/publicar?postId=${post.id}`)}
                onUpdateStatus={profile.handleUpdateStatus}
                onDeletePost={profile.handleDeletePost}
                onOpenMetrics={profile.setMetricsPost}
              />
            </TabsContent>

            <TabsContent value="drafts" className="mt-0 outline-none">
              <ProfileDraftsTab
                drafts={profile.drafts}
                onContinueDraft={(draftId) => navigate(`/publicar?draftId=${draftId}`)}
                onDeleteDraft={profile.handleDeleteDraft}
              />
            </TabsContent>

            <TabsContent value="favorites" className="mt-0 outline-none">
              <ProfileFavoritesTab
                posts={profile.favPosts}
                onToggleFavorite={toggleFavorite}
              />
            </TabsContent>
          </div>
        )}
      </Tabs>

      <EditProfileDialog
        open={profile.isEditProfileDialogOpen}
        isSaving={profile.isSavingProfile}
        name={profile.profileName}
        bio={profile.profileBio}
        onOpenChange={(open) => !profile.isSavingProfile && profile.setIsEditProfileDialogOpen(open)}
        onNameChange={profile.setProfileName}
        onBioChange={profile.setProfileBio}
        onSave={profile.handleSaveProfile}
      />

      <ProfileMetricsDialog
        post={profile.metricsPost}
        onOpenChange={(open) => !open && profile.setMetricsPost(null)}
      />

      <AvatarDialog
        open={profile.isAvatarDialogOpen}
        previewUrl={profile.avatarPreviewUrl}
        isDragActive={profile.isAvatarDragActive}
        isSaving={profile.isSavingAvatar}
        onOpenChange={(open) => !profile.isSavingAvatar && profile.setIsAvatarDialogOpen(open)}
        onDragOver={profile.handleAvatarDragOver}
        onDragLeave={profile.handleAvatarDragLeave}
        onDrop={profile.handleAvatarDrop}
        onFileSelect={profile.handleAvatarFileSelect}
        onCancel={profile.handleCancelAvatar}
        onSave={profile.handleSaveAvatar}
      />

      <ReviewsDialog
        open={profile.isReviewsOpen}
        onOpenChange={profile.setIsReviewsOpen}
        profileName={profile.user.name}
        reviewScore={profile.reviewData.score}
        reviewCount={profile.reviewData.count}
        reviewSummary={profile.reviewData.summary}
        reviews={profile.reviewData.reviews}
      />
    </div>
  );
}
