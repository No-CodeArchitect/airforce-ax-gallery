import { listMedia } from "@/lib/media-items";
import { siteConfig } from "@/lib/site-config";
import MediaManager from "@/components/MediaManager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 사이트 미디어 (특강 소개 영상 · 현장 스케치) — 드래그&드롭
export default async function MediaAdminPage() {
  const [aboutItems, sketchItems] = await Promise.all([listMedia("about"), listMedia("sketch")]);
  return (
    <>
      <PageHeader title="미디어" desc="유튜브 링크나 사진·영상 파일을 끌어다 놓으면 바로 사이트에 반영됩니다. 파일은 50MB까지, 큰 영상은 유튜브 링크를 쓰세요." />
      <div className="flex flex-col gap-6">
        <MediaManager
          slot="sketch"
          title="현장 스케치"
          description={`홈의 '현장 스케치'(최신 2개)와 미디어 페이지(전체)에 표시됩니다. 최신순으로 정렬됩니다. ⚠ ${siteConfig.sketchNotice}`}
          items={sketchItems}
        />
        <MediaManager
          slot="about"
          title="특강 소개 · 대표 영상"
          description="특강 소개(/about) 페이지 상단에 표시되는 영상입니다. 새로 올리면 기존 영상을 대체합니다. 지정하지 않으면 영상 칸 없이 표시됩니다."
          items={aboutItems}
        />
      </div>
    </>
  );
}
