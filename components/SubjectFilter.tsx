"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { subjects } from "@/constants"
import { formUrlQuery, removeKeysFromUrlQuery } from "@jsmastery/utils"
import { usePathname, useSearchParams } from "next/navigation"



export default function SubjectFilter() {
    const pathname = usePathname()

    const router = useRouter()

    const searchParams = useSearchParams()

    const query = searchParams.get('subject') || ''

    const [subject, setSubject] = useState(query)

    useEffect(() => {
        let newUrl =""
        if(subject === "all"){
            newUrl = removeKeysFromUrlQuery({
                params:searchParams.toString(),
                keysToRemove:["subject"]
            })
        }
        else{
            newUrl = formUrlQuery({
                params:searchParams.toString(),
                key:'subject',
                value:subject,
            })
            router.push(newUrl, {scroll:false})
        }
    }, [subject])
    return (
        <div className="border border-black rounded-lg">
            <Select
                onValueChange={setSubject}
                value={subject}
            >
                <SelectTrigger className="input capitalize">
                    <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent
                    className="border border-black"
                >
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map((subject) => (
                        <SelectItem
                            key={subject}
                            value={subject}
                            className="capitalize"
                        >
                            {subject}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}


