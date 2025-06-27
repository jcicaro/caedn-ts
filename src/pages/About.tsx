import React, { useState } from 'react';
import TTSControls from '../components/TtsControls';

export default function About() {
  const [apiKey, setApiKey] = useState('');
  const [text, setText] = useState(
    'Hello, I am your AI assistant! Just let me know how I can help bring your ideas to life.'
  );
  const [model, setModel] = useState('tts-1');
  const [voice, setVoice] = useState('alloy');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setAudioUrl('');

    try {
      const res = await fetch('https://tts.icaro.com.au/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey || 'your_api_key_here'}`,
        },
        body: JSON.stringify({ model, input: text, voice }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Icaro TTS Tester</h1>

      <div className="w-full max-w-lg space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">API Key</span>
          </label>
          <input
            type="password"
            placeholder="Bearer API key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Text to Speak</span>
          </label>
          <textarea
            rows={4}
            className="textarea textarea-bordered w-full"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <div className="form-control w-1/2">
            <label className="label">
              <span className="label-text">Model</span>
            </label>
            <select
              className="select select-bordered"
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              <option value="tts-1">tts-1</option>
            </select>
          </div>

          <div className="form-control w-1/2">
            <label className="label">
              <span className="label-text">Voice</span>
            </label>
            <select
              className="select select-bordered"
              value={voice}
              onChange={e => setVoice(e.target.value)}
            >
              <option value="alloy">alloy</option>
            </select>
          </div>
        </div>

        {/* Use the reusable TTSControls component */}
        <TTSControls
          loading={loading}
          error={error}
          audioUrl={audioUrl}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}


// import { useState } from 'react'

// export default function About() {
//   const [apiKey, setApiKey] = useState('')
//   const [text, setText] = useState(
//     'Hello, I am your AI assistant! Just let me know how I can help bring your ideas to life.'
//   )
//   const [model, setModel] = useState('tts-1')
//   const [voice, setVoice] = useState('alloy')
//   const [audioUrl, setAudioUrl] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handleGenerate = async () => {
//     // if (!apiKey) {
//     //   setError('Please enter your API key.')
//     //   return
//     // }
//     setLoading(true)
//     setError('')
//     setAudioUrl('')
//     try {
//       const res = await fetch('https://tts.icaro.com.au/v1/audio/speech', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer your_api_key_here`,
//         },
//         body: JSON.stringify({ model, input: text, voice }),
//       })
//       if (!res.ok) throw new Error(`HTTP ${res.status}`)
//       const blob = await res.blob()
//       const url = URL.createObjectURL(blob)
//       setAudioUrl(url)
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-base-100 p-6 flex flex-col items-center">
//       <h1 className="text-3xl font-bold mb-6">Icaro TTS Tester</h1>
//       <div className="w-full max-w-lg space-y-4">
//         <div className="form-control">
//           <label className="label">
//             <span className="label-text">API Key</span>
//           </label>
//           <input
//             type="password"
//             placeholder="Bearer API key"
//             value={apiKey}
//             onChange={e => setApiKey(e.target.value)}
//             className="input input-bordered w-full"
//           />
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text">Text to Speak</span>
//           </label>
//           <textarea
//             rows={4}
//             className="textarea textarea-bordered w-full"
//             value={text}
//             onChange={e => setText(e.target.value)}
//           />
//         </div>

//         <div className="flex space-x-2">
//           <div className="form-control w-1/2">
//             <label className="label">
//               <span className="label-text">Model</span>
//             </label>
//             <select
//               className="select select-bordered"
//               value={model}
//               onChange={e => setModel(e.target.value)}
//             >
//               <option value="tts-1">tts-1</option>
//             </select>
//           </div>
//           <div className="form-control w-1/2">
//             <label className="label">
//               <span className="label-text">Voice</span>
//             </label>
//             <select
//               className="select select-bordered"
//               value={voice}
//               onChange={e => setVoice(e.target.value)}
//             >
//               <option value="alloy">alloy</option>
//             </select>
//           </div>
//         </div>

//         <button
//           className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
//           onClick={handleGenerate}
//           disabled={loading}
//         >
//           {loading ? 'Generating...' : 'Generate Speech'}
//         </button>

//         {error && (
//           <div className="text-error text-center">Error: {error}</div>
//         )}

//         {audioUrl && (
//           <audio
//             src={audioUrl}
//             controls
//             className="mt-4 w-full"
//           />
//         )}
//       </div>
//     </div>
//   )
// }