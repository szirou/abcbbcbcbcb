/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, ChangeEvent, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Camera, 
  Upload, 
  Box, 
  Compass, 
  User, 
  Plus, 
  ArrowLeft, 
  MoreHorizontal, 
  Check, 
  Download, 
  Edit3, 
  ChevronLeft,
  Share2,
  HelpCircle,
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Rotate3d,
  FileText,
  Loader2
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import { cn } from './lib/utils';

function Model({ url }: { url: string }) {
  // Using a placeholder GLB if the actual one isn't available
  // In a real app, this would be the generated model URL
  const { scene } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb');
  return <primitive object={scene} scale={1.5} />;
}

function ModelViewer() {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} adjustCamera={1.5}>
            <Model url="" />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Canvas>
    </div>
  );
}

type View = 'assets' | 'detail' | 'upload' | 'result' | 'discover' | 'profile';

interface Asset {
  id: string;
  name: string;
  date: string;
  image: string;
  type: 'FBX' | 'OBJ';
  source: 'camera' | 'upload';
  status: 'ready' | 'processing';
  progress?: number;
  size?: string;
}

const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    name: '北欧极简单人椅',
    date: '2023-11-12',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtTrJxv0blgxFmBmyzKqJNWAsBaQ8Q6XGLDAA3eZZhhLcO5kRUluCzKvzVvGCpoNL7CQodMZA7SO_rbxlDVvT7xhXj34tk584xdb86bbmrKy7Jon2H7jZhBS-5-aSdlBmWypk3xEO61CaDmUA9afy6PfspY6NReH3p_TJYDppoe38pyxxfPx-dk0rP9Uheh1r3eniQfSzS23HNznMX971JjtUOKtbQYTlhHe6rzHGHKyDb95V8iaSwclHL62-h0rAzGfK6MIS5O-8',
    type: 'FBX',
    source: 'camera',
    status: 'ready',
    size: '85CM × 92CM × 78CM'
  },
  {
    id: '2',
    name: '复古陶瓷花瓶',
    date: '2023-11-10',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDltgcXkoEGDOHVt_vNl0SW1ls7eZrQdeAscH7_UTZ-Ztcytjdj1_3eAbcEWWlsDFvxgfArmqG_xevlipZhYTlyBKbPa1WvYhbUvMZlM7TK6FRD0jyASgfPTCFOIOhYQSnxhLh5ymVRzajqLbaARMvoR9cweq8IuYintNNXrJCtrww07vv-JdG7ZVvYHCzsHdij6yRsxiEkW5sCBVg3b8uT_p3DTBjsYPdANprbX_qvXYk-PkM5yPywwM3T2J0753ea4SRU_Qy-OEQ',
    type: 'FBX',
    source: 'upload',
    status: 'ready'
  },
  {
    id: '3',
    name: '现代抽象雕塑',
    date: '2023-11-05',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBVogIWcJYDlf6fQXuOGj1l8quQa3lHmCSJPeZJEQgnm2x10c95nknu2XJoT0rzzxe0v9fzXkF7N4gQWKDg0SZfK9Fj7FHDsz6VTP6FneiyXcL_YJozE24FLNA0sOTUVjDxGs_hJUMmFRfQJKRdXDctr9ctyHVWq5DGkIzpoKdsOmaRgZMgvSVncjt7me5jb6BQckA4Gc1r0PeYX-3PVzCDuzyfo9-wSwp8SZjB82YADd45D2dAp13PGLaHHb_WRkxEt6bb9uj8C0',
    type: 'FBX',
    source: 'camera',
    status: 'ready',
    size: '45CM × 45CM × 120CM'
  },
  {
    id: '4',
    name: '智能运动手表',
    date: '2023-10-28',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuiaZPBejH7Sx6OFkDAUgX6VIbkZzq7IwiDtrPaIlq91MYCwJ0TuIw5-U9nQbgPCoyfhrPzhAfnmGDR0EzmiqemHCwsEHN2w6MfLJJPHZz9_dCUbBWYjpp8FTsbAs2ulfi7JuBjb0uVs39Q9IEsaLFIZ2uq7OeE0qD8B99rrFwBa8KSzgBhBujJmtr-2pUk7ut3BW_g1B92LHL_8u4DYdLpF6-F4CQu8NaDsRcGIAFayEOzRVUenX-dJYhHUfz8LnT5Y67b4Pw0cA',
    type: 'FBX',
    source: 'upload',
    status: 'ready'
  }
];

export default function App() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [currentView, setCurrentView] = useState<View>('assets');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filter, setFilter] = useState<'all' | 'camera' | 'upload'>('all');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter(asset => {
    if (filter === 'all') return true;
    return asset.source === filter;
  });

  const navigateTo = (view: View, asset?: Asset) => {
    if (asset) {
      setSelectedAsset(asset);
      setRotationY(0);
    }
    setCurrentView(view);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmUpload = () => {
    if (!uploadedImage) return;
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: assetName || `新上传资产_${assets.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        image: uploadedImage,
        type: 'FBX',
        source: 'upload',
        status: 'ready'
      };
      setAssets(prev => [newAsset, ...prev]);
      setIsUploading(false);
      setAssetName('');
      navigateTo('result');
    }, 1500);
  };

  const downloadFile = (format: string, assetName: string) => {
    const content = `This is a simulated ${format} file for ${assetName}`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assetName}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'assets' && (
          <motion.div 
            key="assets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
              <span className="text-primary font-display text-lg font-bold tracking-tight">元界智创</span>
              <h1 className="text-lg font-bold tracking-tight">我的资产</h1>
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </header>

            {/* Filters */}
            <section className="px-4 py-4">
              <div className="flex h-11 items-center justify-center rounded-full bg-white/5 p-1">
                {(['all', 'camera', 'upload'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "flex-1 h-full rounded-full text-sm font-medium transition-all",
                      filter === f ? "bg-white/10 text-primary shadow-sm" : "text-slate-400"
                    )}
                  >
                    {f === 'all' ? '全部' : f === 'camera' ? '相机扫描' : '本地上传'}
                  </button>
                ))}
              </div>
            </section>

            {/* Grid */}
            <section className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-y-auto pb-32">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id}
                  onClick={() => asset.status === 'ready' && navigateTo('detail', asset)}
                  className={cn(
                    "flex flex-col gap-2 group cursor-pointer",
                    asset.status === 'processing' && "cursor-default"
                  )}
                >
                  <div className="relative w-full aspect-square bg-white/5 rounded-2xl overflow-hidden">
                    {asset.status === 'ready' ? (
                      <div className="w-full h-full pointer-events-none">
                        <ModelViewer />
                      </div>
                    ) : (
                      <img 
                        src={asset.image} 
                        alt={asset.name}
                        referrerPolicy="no-referrer"
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                          asset.status === 'processing' && "blur-[2px] opacity-60"
                        )}
                      />
                    )}
                    {asset.status === 'ready' && (
                      <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {asset.type}
                      </div>
                    )}
                    {asset.status === 'processing' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                        <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                        <span className="text-white text-[10px] font-medium">处理中 {asset.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="px-1">
                    <p className={cn(
                      "text-sm font-semibold truncate",
                      asset.status === 'processing' ? "text-slate-500" : "text-white"
                    )}>
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {asset.source === 'camera' ? (
                        <Camera className="w-3 h-3 text-slate-500" />
                      ) : (
                        <FileText className="w-3 h-3 text-slate-500" />
                      )}
                      <p className="text-slate-500 text-[11px]">{asset.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 pb-8">
              <div className="flex px-6 py-3 justify-between items-center">
                <button onClick={() => navigateTo('assets')} className="flex flex-col items-center gap-1 text-primary">
                  <Box className="w-6 h-6 fill-current" />
                  <span className="text-[10px] font-medium">资产</span>
                </button>
                <button onClick={() => navigateTo('discover')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Compass className="w-6 h-6" />
                  <span className="text-[10px] font-medium">发现</span>
                </button>
                <button onClick={() => navigateTo('upload')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-medium">扫描</span>
                </button>
                <button onClick={() => navigateTo('profile')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-medium">我的</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}

        {currentView === 'discover' && (
          <motion.div 
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
              <span className="text-primary font-display text-lg font-bold tracking-tight">元界智创</span>
              <h1 className="text-lg font-bold tracking-tight">发现</h1>
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 pb-32">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold mb-4">热门推荐</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQczea7oxQT86TeriSDpIRo6vWU04ymjIE4IGGGVoJr0yA9h9bMtxFCjak1kVgo6EyF4FKjlnlB5hP7WdxkXILD8A43NGI0ZOf4pch6YUwBaYmFH5LZffxeFvkyy2BI_xd7Rfa_DaVMGU_4qcZy8xbCl-K1GrBTiD78lKjjKMN5bxP3aFTnoBLd6Y_mLQXepXzHVqiaMRKrVpGXaIk9KS9tSCm9tDj_IOK-OdQWgpHigReYVzizshsT_740ddC0cI0-4glZEDk-68" 
                        alt="Featured" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                        <h3 className="text-lg font-bold">未来城市景观</h3>
                        <p className="text-sm text-white/60">由 AI 生成的超现实主义 3D 场景</p>
                      </div>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h2 className="text-xl font-bold mb-4">最新动态</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-2">
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/10 mb-2">
                          <img 
                            src={`https://picsum.photos/seed/asset${i}/400/400`} 
                            alt="Asset" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium truncate">创意资产 #{i}</p>
                        <p className="text-xs text-white/40">2小时前</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 pb-8">
              <div className="flex px-6 py-3 justify-between items-center">
                <button onClick={() => navigateTo('assets')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Box className="w-6 h-6" />
                  <span className="text-[10px] font-medium">资产</span>
                </button>
                <button onClick={() => navigateTo('discover')} className="flex flex-col items-center gap-1 text-primary">
                  <Compass className="w-6 h-6 fill-current" />
                  <span className="text-[10px] font-medium">发现</span>
                </button>
                <button onClick={() => navigateTo('upload')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-medium">扫描</span>
                </button>
                <button onClick={() => navigateTo('profile')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-medium">我的</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}

        {currentView === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <header className="p-6 flex flex-col items-center pt-12">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary p-1 mb-4">
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">智创用户</h1>
              <p className="text-white/40 text-sm mt-1">ID: 8829103</p>
              
              <div className="flex gap-8 mt-8 w-full justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold">12</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">资产</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-xl font-bold">2.4k</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">获赞</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-xl font-bold">156</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">关注</p>
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto px-4 pb-32">
              <div className="space-y-2">
                {[
                  { icon: Box, label: '我的收藏', count: '5' },
                  { icon: Download, label: '下载历史', count: '28' },
                  { icon: Settings, label: '设置', count: null },
                  { icon: HelpCircle, label: '帮助与反馈', count: null },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.count && <span className="text-xs text-white/40">{item.count}</span>}
                      <ChevronLeft className="w-4 h-4 rotate-180 text-white/20" />
                    </div>
                  </button>
                ))}
              </div>
              
              <button className="w-full mt-8 p-4 text-red-400 font-medium bg-red-400/5 rounded-2xl">
                退出登录
              </button>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 pb-8">
              <div className="flex px-6 py-3 justify-between items-center">
                <button onClick={() => navigateTo('assets')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Box className="w-6 h-6" />
                  <span className="text-[10px] font-medium">资产</span>
                </button>
                <button onClick={() => navigateTo('discover')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Compass className="w-6 h-6" />
                  <span className="text-[10px] font-medium">发现</span>
                </button>
                <button onClick={() => navigateTo('upload')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-medium">扫描</span>
                </button>
                <button onClick={() => navigateTo('profile')} className="flex flex-col items-center gap-1 text-primary">
                  <User className="w-6 h-6 fill-current" />
                  <span className="text-[10px] font-medium">我的</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}

        {currentView === 'detail' && selectedAsset && (
          <motion.div 
            key="detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-1 flex flex-col bg-background-black"
          >
            <header className="fixed top-0 left-0 right-0 z-50 pt-12 pb-6 px-6 text-center bg-gradient-to-b from-black/60 to-transparent">
              <h1 className="text-xl font-medium tracking-wide">{selectedAsset.name}</h1>
              {selectedAsset.size && (
                <p className="text-slate-400 text-xs mt-1 font-light uppercase tracking-[0.1em]">Size: {selectedAsset.size}</p>
              )}
            </header>

            <main className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#2a3441_0%,#0a0c10_100%)]">
              <button 
                onClick={() => navigateTo('assets')}
                className="absolute top-12 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="relative w-full h-full flex items-center justify-center">
                <ModelViewer />
                
                <div className="absolute bottom-12 flex flex-col items-center gap-1 opacity-70 pointer-events-none">
                  <Rotate3d className="w-8 h-8" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-light tracking-[0.2em] uppercase">Drag to rotate</span>
                    <span className="text-[10px] font-light tracking-[0.2em]">拖拽以旋转查看</span>
                  </div>
                </div>
              </div>
            </main>

            <section className="px-6 pt-4 pb-8 bg-gradient-to-t from-black to-transparent">
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-2">
                  {['FBX', 'OBJ', 'GLTF'].map((format) => (
                    <button 
                      key={format}
                      onClick={() => downloadFile(format, selectedAsset.name)}
                      className="h-14 bg-white text-black font-semibold rounded-2xl flex items-center justify-center gap-1 transition-transform active:scale-95 text-xs"
                    >
                      <Download className="w-4 h-4" />
                      {format}
                    </button>
                  ))}
                </div>
                <button className="w-full h-14 bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <Edit3 className="w-5 h-5" />
                  重新编辑
                </button>
              </div>
              <div className="mt-8">
                <p className="text-slate-600 text-[10px] font-normal tracking-[0.3em] text-center uppercase">元界智创</p>
              </div>
            </section>

            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-8">
              <div className="flex px-6 py-3 justify-between items-center">
                <button onClick={() => navigateTo('assets')} className="flex flex-col items-center gap-1 text-white">
                  <Box className="w-6 h-6 fill-current" />
                  <span className="text-[10px] font-medium">资产</span>
                </button>
                <button onClick={() => navigateTo('discover')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Compass className="w-6 h-6" />
                  <span className="text-[10px] font-medium">发现</span>
                </button>
                <button onClick={() => navigateTo('upload')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-medium">扫描</span>
                </button>
                <button onClick={() => navigateTo('profile')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-medium">我的</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}

        {currentView === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="flex-1 flex flex-col bg-background-dark"
          >
            <header className="flex items-center p-4 justify-between">
              <button onClick={() => navigateTo('assets')} className="w-12 h-12 flex items-center justify-center">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-medium font-display">本地图片上传</h2>
              <button className="w-12 h-12 flex items-center justify-center">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
              />
              <div 
                onClick={triggerFileUpload}
                className="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center active:scale-[0.98] transition-transform mb-10 overflow-hidden cursor-pointer"
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-white/60" />
                    </div>
                    <p className="text-white/60 text-sm font-light">点击选择本地照片</p>
                    <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">Support: JPG, PNG, HEIC</p>
                  </>
                )}
              </div>

              {uploadedImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 mb-10"
                >
                  <label className="text-sm font-medium text-white/60 ml-1">资产名称</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="输入资产名称..."
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <Edit3 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
              <button 
                onClick={handleConfirmUpload}
                disabled={!uploadedImage || isUploading}
                className={cn(
                  "w-full h-14 bg-primary text-white rounded-full font-medium text-lg shadow-[0_0_20px_rgba(19,127,236,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2",
                  (!uploadedImage || isUploading) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>确认上传</span>
                    <Upload className="w-5 h-5" />
                  </>
                )}
              </button>
              <div className="mt-6 text-center">
                <p className="text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] font-display">元界智创</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col bg-background-dark"
          >
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-50">
              <button onClick={() => navigateTo('assets')} className="w-12 h-12 flex items-center justify-center">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold tracking-tight flex-1 text-center pr-12">扫描结果</h2>
            </header>

            <main className="flex-1 flex flex-col items-center px-6 py-8 bg-[radial-gradient(at_0%_0%,rgba(19,127,236,0.15)_0,transparent_50%),radial-gradient(at_100%_100%,rgba(19,127,236,0.1)_0,transparent_50%)]">
              <div className="w-full max-w-sm aspect-square relative mb-12">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-30" />
                <div className="relative w-full h-full rounded-full border-4 border-white/10 shadow-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
                  <ModelViewer />
                  
                  <motion.div 
                    className="absolute inset-x-0 h-[1px] bg-primary top-1/2 pointer-events-none z-20"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 z-20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-widest uppercase">AI Verified</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-[32px] font-bold leading-tight">识别成功</h1>
                <p className="text-slate-400 text-lg font-normal leading-normal max-w-xs">
                  AI 已完成物体结构分析<br />
                  正在生成高精度 FBX 资产
                </p>
              </div>

              <div className="w-full max-w-sm mt-12 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-slate-400 text-sm font-medium">拓扑面数</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">12,402</p>
                    <span className="text-xs text-slate-500">Tris</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-slate-400 text-sm font-medium">预估大小</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">4.2</p>
                    <span className="text-xs text-slate-500">MB</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto w-full max-w-sm pt-8 flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2">
                  {['FBX', 'OBJ', 'GLTF'].map((format) => (
                    <button 
                      key={format}
                      onClick={() => downloadFile(format, '扫描资产')}
                      className="h-14 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <Download className="w-4 h-4" />
                      {format}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => navigateTo('assets')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <span>返回资产库</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </main>

            <footer className="py-8 flex flex-col items-center justify-center">
              <p className="text-slate-600 text-xs tracking-[0.4em] font-medium uppercase">元界智创</p>
              <div className="h-1 w-8 bg-primary/20 rounded-full mt-2" />
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
