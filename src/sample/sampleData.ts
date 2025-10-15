// src/sample/sampleData.ts
import type { Project } from '../components/ProjectCard'
import type { Clip } from '../components/ClipCard'

export const SAMPLE_PROJECT_ID = 'sample'

export const sampleProject: Project = {
    id: SAMPLE_PROJECT_ID,
    title: 'Sample Project – “The Merch Pivot”',
    thumb: '/src/assets/thumb1.jpg',
    plan: 'Free',
    status: 'Demo',
    duration: '12:31',
    coherence: 0.86,
    hook: 0.72,
}

export const sampleClips: (Clip & { _durationSec: number })[] = [
    {
        id: 's1',
        title: 'Smarter merch pivot',
        thumb: '/src/assets/thumb2.jpg',
        duration: '0:45',
        score: 88,
        captions: true,
        scheduled: false,
        _durationSec: 45,
    },
    {
        id: 's2',
        title: 'Sold out day one',
        thumb: '/src/assets/thumb3.jpg',
        duration: '0:38',
        score: 83,
        captions: true,
        scheduled: false,
        _durationSec: 38,
    },
    {
        id: 's3',
        title: 'From truck to mall',
        thumb: '/src/assets/thumb1.jpg',
        duration: '1:02',
        score: 91,
        captions: false,
        scheduled: false,
        _durationSec: 62,
    },
]
