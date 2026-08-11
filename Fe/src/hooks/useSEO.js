import { useEffect } from 'react'

// Sætter side-titel + meta description pr. side (uden ekstra pakker).
// Brug: useSEO('Titel | shr.dk', 'Beskrivelse til Google')
export function useSEO(title, description) {
    useEffect(() => {
        if (title) document.title = title
        if (description) {
            let tag = document.querySelector('meta[name="description"]')
            if (!tag) {
                tag = document.createElement('meta')
                tag.setAttribute('name', 'description')
                document.head.appendChild(tag)
            }
            tag.setAttribute('content', description)
        }
    }, [title, description])
}
