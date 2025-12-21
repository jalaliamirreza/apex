export function FormLoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
      {/* Shell Bar Skeleton */}
      <div style={{ height: '44px', background: '#354a5f' }} />

      {/* Breadcrumb Skeleton */}
      <div style={{
        padding: '0.75rem 1.5rem',
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <SkeletonBox width="50px" height="14px" />
        <span style={{ color: '#ccc' }}>/</span>
        <SkeletonBox width="80px" height="14px" />
        <span style={{ color: '#ccc' }}>/</span>
        <SkeletonBox width="120px" height="14px" />
      </div>

      {/* Content Skeleton */}
      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Header Skeleton */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e5e5',
            background: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <SkeletonBox width="40px" height="40px" borderRadius="8px" />
            <div>
              <SkeletonBox width="200px" height="20px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox width="300px" height="14px" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div style={{ padding: '1.5rem' }}>
            {/* Section 1 */}
            <div style={{ marginBottom: '2rem' }}>
              <SkeletonBox width="150px" height="18px" style={{ marginBottom: '1rem' }} />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem'
              }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i}>
                    <SkeletonBox width="80px" height="14px" style={{ marginBottom: '0.5rem' }} />
                    <SkeletonBox width="100%" height="40px" borderRadius="4px" />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <SkeletonBox width="120px" height="18px" style={{ marginBottom: '1rem' }} />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem'
              }}>
                {[1, 2].map(i => (
                  <div key={i}>
                    <SkeletonBox width="80px" height="14px" style={{ marginBottom: '0.5rem' }} />
                    <SkeletonBox width="100%" height="40px" borderRadius="4px" />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <SkeletonBox width="80px" height="14px" style={{ marginBottom: '0.5rem' }} />
                <SkeletonBox width="100%" height="100px" borderRadius="4px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function SkeletonBox({
  width,
  height,
  borderRadius = '4px',
  style = {}
}: {
  width: string;
  height: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e5e5e5 25%, #f0f0f0 50%, #e5e5e5 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  );
}
