import CompanionCard from "@/components/CompanionCard"
import SearchInput from "@/components/SearchInput"
import SubjectFilter from "@/components/SubjectFilter"
import { getAllCompanions } from "@/lib/actions/companion.actions"
import { getSubjectColor } from "@/lib/utils"

export default async function CompanionsLibrary({searchParams}:SearchParams) {
    const filters = await searchParams
    const subject = filters.subject ? filters.subject: ""
    const topic = filters.topic ? filters.topic: ""

    const companions = await getAllCompanions({subject, topic})


    return (
        <main>
            <section className="flex justify-between gap-4 max-sm:flex-col">
                <h1>Companion Library</h1>
                <div className="flex gap-4">
                    <SearchInput/>
                    <SubjectFilter/>    
                </div>
            </section>
            <section className="companions-grid">
                {companions.map((companion)=>(
                    <CompanionCard
                    key={companion.id}
                    id={companion.id}
                    name={companion.name}
                    topic={companion.topic}
                    subject={companion.subject}
                    duration={companion.duration}
                    color={getSubjectColor(companion.subject)}
                    //o usar {...companion}
                    />
                ))}
            </section>
        </main>
    )
}
