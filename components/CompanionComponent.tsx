"use client"
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { CompanionComponentProps, SavedMessage } from "@/types";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import { addToSessionHistory } from "@/lib/actions/companion.actions";


enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED"
}

export default function CompanionComponent({ companionId, subject, topic, name, userName, userImage, style, voice }: CompanionComponentProps) {

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const lottieRef = useRef<LottieRefCurrentProps>(null)
    const [messages, setMessages] = useState<SavedMessage[]>([])

    useEffect(() => {
        if (lottieRef.current) {
            if (isSpeaking) {
                lottieRef.current.play()
            }
            else {
                lottieRef.current.stop()
            }
        }
    }, [isSpeaking])

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE)
            setIsSpeaking(false)
        }
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED)
            setIsSpeaking(false)
            addToSessionHistory(companionId)
        }
        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = {
                    role: message.role,
                    content: message.transcript,
                }
                setMessages((prev) => [newMessage, ...prev])
            }
        }
        const onSpeachStart = () => setIsSpeaking(true)
        const onSpeachEnd = () => setIsSpeaking(false)
        const onError = (error: Error) => console.log('Error ', error)

        //Comienza la llamada
        vapi.on("call-start", onCallStart)
        //Termina o se corta la llamda
        vapi.on("call-end", onCallEnd)
        //Cada vez que llega un mensaje o transcripción del asistente
        vapi.on("message", onMessage)
        //Cuando ocurre un error en (audio, red, permisos,etc)
        vapi.on("error", onError)
        //Cuando el asistente empieza a hablar
        vapi.on("speech-start", onSpeachStart)
        //Cuando el asistente deja de hablar
        vapi.on("speech-end", onSpeachEnd)

        return () => {
            //Comienza la llamada
            vapi.off("call-start", onCallStart)
            //Termina o se corta la llamda
            vapi.off("call-end", onCallEnd)
            //Cada vez que llega un mensaje o transcripción del asistente
            vapi.off("message", onMessage)
            //Cuando ocurre un error en (audio, red, permisos,etc)
            vapi.off("error", onError)
            //Cuando el asistente empieza a hablar
            vapi.off("speech-start", onSpeachStart)
            //Cuando el asistente deja de hablar
            vapi.off("speech-end", onSpeachEnd)
        }
    }, [])

    const toggleMicrophone = () => {
        const isMuted = vapi.isMuted()
        vapi.setMuted(!isMuted)
        setIsMuted(!isMuted)
    }

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)
        const assistantOverrides = {
            variableValues: { subject, topic, style },
            clientMessages: ['transcript'],
            serverMessages: [],
        }

        // @ts-expect-error Voice API vapi.start signature is not fully typed in current library version
        vapi.start(configureAssistant(voice, style), assistantOverrides)
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED)
        setIsSpeaking(false)
        vapi.stop()
    }

    return (
        <section className="flex flex-col h-[70vh]">
            <section className="flex gap-8 max-sm:flex-col">
                <div className="companion-section">
                    <div className="companion-avatar" style={{ background: getSubjectColor(subject) }}>
                        <div className={
                            cn(
                                "absolute transition-opacity duration-300",
                                (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE || (callStatus === CallStatus.ACTIVE && !isSpeaking))
                                    ? "opacity-100"
                                    : "opacity-0",
                                callStatus === CallStatus.CONNECTING && "animate-pulse"
                            )}>
                            <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className="max-sm:w-fit" />
                        </div>
                        <div className={cn(
                            'absolute transition-opacity duration-300',
                            (callStatus === CallStatus.ACTIVE && isSpeaking)
                                ? 'opacity-100'
                                : 'opacity-0'
                        )}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                loop={true}
                                className="companion-lottie"
                            />
                        </div>
                    </div>
                    <p className="font-bold text-2xl">{name}</p>
                </div>
                <div className="user-section">
                    <div className="user-avatar">
                        <Image
                            src={userImage}
                            alt={userName}
                            width={130}
                            height={130}
                            className="rounded-lg"
                        />
                    </div>
                    <button
                        className="btn-mic"
                        onClick={toggleMicrophone}
                        disabled={callStatus !== CallStatus.ACTIVE}
                    >
                        <Image
                            src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'}
                            alt="mic"
                            width={36}
                            height={36}
                        />
                        <p className="max-sm:hidden">
                            {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                        </p>
                    </button>
                    <button
                        className={
                            cn('rounded-lg py-2 cursor-pointer transition-colors w-full text-white', callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary',
                                callStatus === CallStatus.CONNECTING && 'animate-pulse'
                            )}
                        onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                    >

                        {
                            callStatus === CallStatus.ACTIVE
                                ? "End Session"
                                : callStatus === CallStatus.CONNECTING
                                    ? "Connecting"
                                    : "Start Session"
                        }
                    </button>
                </div>
            </section>
            <section className="transcript">
                <div className="transcript-message no-scrollbar">
                    {
                        messages.map((message, index) => {
                            if (message.role === 'assistant') {
                                return (
                                    <p key={index} className="max-sm:text-sm">
                                        {
                                            name
                                                .split(' ')[0]
                                                .replace('/[.,]/g, ', '')
                                        }: {message.content}
                                    </p>
                                )
                            }
                            else {
                                return <p key={index} className="text-primary max-sm:text-sm">
                                    {userName} : {message.content}
                                </p>
                            }
                        })
                    }
                </div>
                <div className="transcript-fade">

                </div>
            </section>
        </section>
    )
}
