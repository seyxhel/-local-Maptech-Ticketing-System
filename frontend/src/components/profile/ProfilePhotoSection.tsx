import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Eye, ImageUp, Loader2, Pencil, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { removeAvatar, uploadAvatar } from '../../services/authService';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EDITOR_VIEWPORT_SIZE = 220;
const EXPORT_SIZE = 512;

function isBlobUrl(url: string | null | undefined): url is string {
  return Boolean(url && url.startsWith('blob:'));
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load selected image.'));
    img.src = url;
  });
}

async function buildEditedAvatarFile(params: {
  sourceUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  fileName: string;
}): Promise<File> {
  const image = await loadImage(params.sourceUrl);
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot prepare avatar editor.');

  const baseScale = Math.max(EXPORT_SIZE / image.width, EXPORT_SIZE / image.height);
  const finalScale = baseScale * params.zoom;
  const width = image.width * finalScale;
  const height = image.height * finalScale;
  const ratio = EXPORT_SIZE / EDITOR_VIEWPORT_SIZE;
  const x = (EXPORT_SIZE - width) / 2 + params.offsetX * ratio;
  const y = (EXPORT_SIZE - height) / 2 + params.offsetY * ratio;

  ctx.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  ctx.drawImage(image, x, y, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('Failed to prepare edited avatar.'));
          return;
        }
        resolve(result);
      },
      'image/jpeg',
      0.92
    );
  });

  return new File([blob], params.fileName, { type: 'image/jpeg' });
}

export function ProfilePhotoSection() {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [removeAvatarLoading, setRemoveAvatarLoading] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [avatarLightboxOpen, setAvatarLightboxOpen] = useState(false);

  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSourceUrl, setEditorSourceUrl] = useState<string | null>(null);
  const [editorSourceName, setEditorSourceName] = useState('avatar.jpg');
  const [editorZoom, setEditorZoom] = useState(1);
  const [editorOffsetX, setEditorOffsetX] = useState(0);
  const [editorOffsetY, setEditorOffsetY] = useState(0);

  useEffect(() => {
    return () => {
      if (isBlobUrl(localAvatarPreview)) {
        URL.revokeObjectURL(localAvatarPreview);
      }
      if (isBlobUrl(editorSourceUrl)) {
        URL.revokeObjectURL(editorSourceUrl);
      }
    };
  }, [editorSourceUrl, localAvatarPreview]);

  const serverAvatarUrl = user?.profile_picture_url ?? null;

  const avatarSrc = useMemo(() => {
    if (localAvatarPreview) return localAvatarPreview;
    if (!serverAvatarUrl) return null;
    return `${serverAvatarUrl}?t=${encodeURIComponent(serverAvatarUrl.split('/').pop() || '')}`;
  }, [localAvatarPreview, serverAvatarUrl]);

  const resetEditor = () => {
    setEditorOpen(false);
    if (isBlobUrl(editorSourceUrl)) {
      URL.revokeObjectURL(editorSourceUrl);
    }
    setEditorSourceUrl(null);
    setEditorSourceName('avatar.jpg');
    setEditorZoom(1);
    setEditorOffsetX(0);
    setEditorOffsetY(0);
  };

  const openEditorFromFile = (file: File) => {
    const imageType = file.type.toLowerCase();
    if (!imageType.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Selected file is too large. Maximum size is 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    if (isBlobUrl(editorSourceUrl)) {
      URL.revokeObjectURL(editorSourceUrl);
    }
    setEditorSourceUrl(url);
    setEditorSourceName(file.name || 'avatar.jpg');
    setEditorZoom(1);
    setEditorOffsetX(0);
    setEditorOffsetY(0);
    setEditorOpen(true);
    setAvatarImgError(false);
  };

  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      openEditorFromFile(file);
    }
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleOpenEditorForCurrent = () => {
    if (!serverAvatarUrl && !localAvatarPreview) {
      avatarInputRef.current?.click();
      return;
    }

    const source = localAvatarPreview || serverAvatarUrl;
    if (!source) {
      avatarInputRef.current?.click();
      return;
    }

    if (isBlobUrl(editorSourceUrl)) {
      URL.revokeObjectURL(editorSourceUrl);
    }

    setEditorSourceUrl(source);
    setEditorSourceName('avatar.jpg');
    setEditorZoom(1);
    setEditorOffsetX(0);
    setEditorOffsetY(0);
    setEditorOpen(true);
  };

  const handleSaveEditedAvatar = async () => {
    if (!editorSourceUrl) return;

    const previousProfileUrl = user?.profile_picture_url ?? null;

    setAvatarLoading(true);
    try {
      const editedFile = await buildEditedAvatarFile({
        sourceUrl: editorSourceUrl,
        zoom: editorZoom,
        offsetX: editorOffsetX,
        offsetY: editorOffsetY,
        fileName: editorSourceName.endsWith('.jpg') || editorSourceName.endsWith('.jpeg')
          ? editorSourceName
          : `${editorSourceName.replace(/\.[^.]*$/, '') || 'avatar'}.jpg`,
      });

      const optimisticPreview = URL.createObjectURL(editedFile);
      if (isBlobUrl(localAvatarPreview)) {
        URL.revokeObjectURL(localAvatarPreview);
      }
      setLocalAvatarPreview(optimisticPreview);
      updateUser({ profile_picture_url: optimisticPreview });

      resetEditor();

      const updated = await uploadAvatar(editedFile);
      updateUser({ profile_picture_url: updated.profile_picture_url ?? null });

      if (isBlobUrl(optimisticPreview)) {
        setTimeout(() => URL.revokeObjectURL(optimisticPreview), 5000);
      }
      setLocalAvatarPreview(null);
      toast.success('Profile picture updated.');
    } catch (err) {
      setLocalAvatarPreview(null);
      updateUser({ profile_picture_url: previousProfileUrl });
      toast.error(err instanceof Error ? err.message : 'Failed to upload picture.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setRemoveAvatarLoading(true);
    try {
      await removeAvatar();
      if (isBlobUrl(localAvatarPreview)) {
        URL.revokeObjectURL(localAvatarPreview);
      }
      setLocalAvatarPreview(null);
      setAvatarImgError(false);
      updateUser({ profile_picture_url: null });
      toast.success('Profile picture removed.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove picture.');
    } finally {
      setRemoveAvatarLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <div
            className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer group"
            onClick={() => {
              if (avatarLoading || removeAvatarLoading) return;
              if (avatarSrc && !avatarImgError) setAvatarLightboxOpen(true);
              else avatarInputRef.current?.click();
            }}
          >
            {avatarSrc && !avatarImgError ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarImgError(true)}
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarLoading
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : (avatarSrc && !avatarImgError)
                ? <Eye className="w-6 h-6 text-white" />
                : <Camera className="w-6 h-6 text-white" />}
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarInputChange}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Picture</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">JPG, PNG or GIF · Max 5 MB</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => !avatarLoading && !removeAvatarLoading && avatarInputRef.current?.click()}
              disabled={avatarLoading || removeAvatarLoading}
              className="text-xs font-medium text-[#3BC25B] hover:text-[#63D44A] transition-colors disabled:opacity-50"
            >
              Change photo
            </button>
            <span className="text-gray-500 dark:text-gray-600 text-xs">·</span>
            <button
              type="button"
              onClick={handleOpenEditorForCurrent}
              disabled={avatarLoading || removeAvatarLoading}
              className="text-xs font-medium text-[#3BC25B] hover:text-[#63D44A] transition-colors disabled:opacity-50"
            >
              Edit photo
            </button>
            {(serverAvatarUrl || localAvatarPreview) && (
              <>
                <span className="text-gray-500 dark:text-gray-600 text-xs">·</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading || removeAvatarLoading}
                  className="text-xs font-medium text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {removeAvatarLoading ? 'Removing...' : 'Remove photo'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {avatarLightboxOpen && avatarSrc && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setAvatarLightboxOpen(false)}
        >
          <div className="relative max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAvatarLightboxOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={avatarSrc}
              alt="Profile preview"
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>,
        document.body
      )}

      {editorOpen && editorSourceUrl && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4"
          onClick={resetEditor}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#0E8F79]" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Edit photo before uploading</h3>
              </div>
              <button
                type="button"
                onClick={resetEditor}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="mx-auto w-[220px] h-[220px] rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <img
                  src={editorSourceUrl}
                  alt="Avatar edit preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `translate(${editorOffsetX}px, ${editorOffsetY}px) scale(${editorZoom})`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.01}
                  value={editorZoom}
                  onChange={(e) => setEditorZoom(Number(e.target.value))}
                  className="w-full"
                />

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Horizontal Position
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={editorOffsetX}
                  onChange={(e) => setEditorOffsetX(Number(e.target.value))}
                  className="w-full"
                />

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vertical Position
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={editorOffsetY}
                  onChange={(e) => setEditorOffsetY(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ImageUp className="w-4 h-4" />
                  Choose another
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedAvatar}
                  disabled={avatarLoading}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#63D44A] to-[#0E8F79] hover:opacity-95 disabled:opacity-60"
                >
                  {avatarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
                  {avatarLoading ? 'Uploading...' : 'Upload photo'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
